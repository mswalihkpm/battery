import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Star, Heart, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";

interface BestsellerProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  discount_percent: number | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
  product_number: number | null;
  order_count: number;
}

const DealsSection = () => {
  const [products, setProducts] = useState<BestsellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchBestsellers();
  }, []);

  const fetchBestsellers = async () => {
    // Get most ordered product IDs
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id");

    if (!orderItems || orderItems.length === 0) {
      setLoading(false);
      return;
    }

    // Count orders per product
    const countMap: Record<string, number> = {};
    orderItems.forEach((item) => {
      if (item.product_id) {
        countMap[item.product_id] = (countMap[item.product_id] || 0) + 1;
      }
    });

    const sortedIds = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    if (sortedIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: prods } = await supabase
      .from("products")
      .select("id, name, brand, price, discount_percent, images, rating, review_count, product_number")
      .in("id", sortedIds)
      .eq("is_active", true);

    if (prods) {
      const withCount = prods.map((p) => ({
        ...p,
        order_count: countMap[p.id] || 0,
      }));
      withCount.sort((a, b) => b.order_count - a.order_count);
      setProducts(withCount);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-tarbo-gold fill-tarbo-gold" />
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Top Sellers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-secondary rounded w-1/2" />
                  <div className="h-4 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-6 w-6 text-tarbo-gold fill-tarbo-gold" />
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Top Sellers</h2>
          <span className="ml-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            Most Ordered
          </span>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} isWishlisted={isInWishlist(product.id)} onToggleWishlist={() => toggleWishlist(product.id)} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-3 min-w-max pb-2">
            {products.map((product, index) => (
              <div key={product.id} className="w-40">
                <ProductCard product={product} index={index} isWishlisted={isInWishlist(product.id)} onToggleWishlist={() => toggleWishlist(product.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product, index, isWishlisted, onToggleWishlist }: { product: BestsellerProduct; index: number; isWishlisted: boolean; onToggleWishlist: () => void }) => {
  const discountedPrice = product.price - (product.price * (product.discount_percent || 0)) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all tarbo-shadow hover:shadow-tarbo-lg cursor-pointer"
    >
      {(product.discount_percent || 0) > 0 && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md tarbo-gradient text-primary-foreground text-xs font-bold">
          {product.discount_percent}% OFF
        </div>
      )}

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(); }}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
      >
        <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
      </button>

      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-3">
          {product.product_number && (
            <p className="text-[10px] text-muted-foreground font-mono mb-0.5">#{product.product_number}</p>
          )}
          <p className="text-xs text-muted-foreground font-medium mb-1">{product.brand || "TARBO"}</p>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10">
                <span className="text-xs font-semibold text-primary">{Number(product.rating).toFixed(1)}</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">₹{Math.round(discountedPrice)}</span>
            {(product.discount_percent || 0) > 0 && (
              <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DealsSection;
