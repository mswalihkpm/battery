import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X, Star, Heart, ChevronDown, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

interface Product {
  id: string;
  name: string;
  price: number;
  discount_percent: number;
  images: string[];
  brand: string | null;
  rating: number | null;
  review_count: number | null;
  sizes: string[];
  colors: string[];
  product_number: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const { toggleWishlist, isInWishlist } = useWishlist();

  const allSizes = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];
  const allColors = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Navy", "Grey", "Brown"];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedSizes, selectedColors, priceRange, sortBy, searchQuery]);

  // Update selectedCategory when URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat !== null && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    if (search !== null && search !== searchQuery) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("sort_order");
    if (data) setCategories(data);
  };

  const parentCategories = categories.filter(c => !c.parent_id);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("id, name, price, discount_percent, images, brand, rating, review_count, sizes, colors, product_number")
      .eq("is_active", true);

    if (selectedCategory) {
      // Find matching category (could be parent or child)
      const matchedCat = categories.find(c => c.slug === selectedCategory);
      if (matchedCat) {
        if (!matchedCat.parent_id) {
          // Parent category - get all child category IDs too
          const childIds = categories.filter(c => c.parent_id === matchedCat.id).map(c => c.id);
          const allIds = [matchedCat.id, ...childIds];
          query = query.in("category_id", allIds);
        } else {
          query = query.eq("category_id", matchedCat.id);
        }
      } else {
        // Fallback: search by slug
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategory)
          .single();
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }
    }

    if (selectedBrand) {
      query = query.ilike("brand", `%${selectedBrand}%`);
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
    }

    query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);

    switch (sortBy) {
      case "price-low": query = query.order("price", { ascending: true }); break;
      case "price-high": query = query.order("price", { ascending: false }); break;
      case "rating": query = query.order("rating", { ascending: false, nullsFirst: false }); break;
      case "discount": query = query.order("discount_percent", { ascending: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(50);
    
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      let filtered = data || [];
      if (selectedSizes.length > 0) {
        filtered = filtered.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
      }
      if (selectedColors.length > 0) {
        filtered = filtered.filter(p => p.colors?.some(c => selectedColors.includes(c)));
      }
      setProducts(filtered);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 10000]);
    setSortBy("newest");
    setSearchParams({});
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  // Get current category display name
  const currentCatName = selectedCategory
    ? categories.find(c => c.slug === selectedCategory)?.name || "All Products"
    : "All Products";

  // Show subcategories if a parent category is selected
  const selectedCatObj = categories.find(c => c.slug === selectedCategory);
  const subcategories = selectedCatObj && !selectedCatObj.parent_id
    ? categories.filter(c => c.parent_id === selectedCatObj.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{currentCatName}</h1>
            <p className="text-muted-foreground text-sm mt-1">{products.length} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary outline-none">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Best Discount</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <button onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        </div>

        {/* Subcategory chips */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => { setSelectedCategory(sub.slug); setSearchParams({ category: sub.slug }); }}
                className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters */}
        {(selectedCategory || selectedBrand || selectedSizes.length > 0 || selectedColors.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {currentCatName}
                <button onClick={() => { setSelectedCategory(""); setSearchParams({}); }}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedSizes.map(size => (
              <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Size: {size}
                <button onClick={() => toggleSize(size)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {selectedColors.map(color => (
              <span key={color} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {color}
                <button onClick={() => toggleColor(color)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground">Clear all</button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-secondary rounded w-1/2" />
                  <div className="h-4 bg-secondary rounded" />
                  <div className="h-4 bg-secondary rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found</p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} isWishlisted={isInWishlist(product.id)} onToggleWishlist={() => toggleWishlist(product.id)} />
            ))}
          </div>
        )}
      </main>

      {/* Filter Sidebar */}
      {showFilters && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-6">
              {/* Category */}
              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {parentCategories.map(cat => (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.slug ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Size */}
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => (
                    <button key={size} onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedSizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color */}
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {allColors.map(color => (
                    <button key={color} onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedColors.includes(color) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-primary">₹{priceRange[0].toLocaleString()}</span>
                    <span className="text-muted-foreground">to</span>
                    <span className="text-primary">₹{priceRange[1].toLocaleString()}</span>
                  </div>
                  <Slider min={0} max={10000} step={100} value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])} className="w-full" />
                  <div className="flex items-center gap-3">
                    <input type="number" value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm" />
                    <span className="text-muted-foreground text-sm">–</span>
                    <input type="number" value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[[0,500],[500,1000],[1000,2000],[2000,5000],[5000,10000]].map(([min,max]) => (
                      <button key={`${min}-${max}`} onClick={() => setPriceRange([min, max])}
                        className={`px-2 py-1 rounded-lg border text-xs transition-colors ${priceRange[0] === min && priceRange[1] === max ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                        ₹{min === 0 ? "0" : `${min/1000}k`} – ₹{max >= 10000 ? "10k+" : `${max/1000}k`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sort (Mobile) */}
              <div className="md:hidden">
                <h3 className="font-semibold mb-3">Sort By</h3>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>
              <button onClick={() => setShowFilters(false)}
                className="w-full py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold">
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
};

const ProductCard = ({ product, index, isWishlisted, onToggleWishlist }: {
  product: Product; index: number; isWishlisted: boolean; onToggleWishlist: () => void;
}) => {
  const discountedPrice = product.price - (product.price * (product.discount_percent || 0)) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all tarbo-shadow hover:shadow-tarbo-lg"
    >
      {product.discount_percent > 0 && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md tarbo-gradient text-primary-foreground text-xs font-bold">
          {product.discount_percent}% OFF
        </div>
      )}
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(); }}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
        <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
      </button>
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img src={product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80"}
            alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-3">
          {product.product_number && (
            <p className="text-[10px] text-muted-foreground font-mono mb-0.5">#{product.product_number}</p>
          )}
          <p className="text-xs text-muted-foreground font-medium mb-1">{product.brand || "TARBO"}</p>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10">
                <span className="text-xs font-semibold text-primary">{product.rating.toFixed(1)}</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
              {product.review_count && <span className="text-xs text-muted-foreground">({product.review_count})</span>}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">₹{Math.round(discountedPrice)}</span>
            {product.discount_percent > 0 && <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Products;
