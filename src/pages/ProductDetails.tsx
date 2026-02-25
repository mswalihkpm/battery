import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Truck, Shield, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ReviewForm from "@/components/ReviewForm";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percent: number;
  images: string[];
  brand: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number | null;
  review_count: number | null;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  media_urls: string[] | null;
  profile: {
    full_name: string | null;
  } | null;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      navigate("/products");
      return;
    }

    setProduct(data);
    if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
    if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        title,
        comment,
        is_verified,
        created_at,
        media_urls,
        profile:profiles!reviews_user_id_fkey (
          full_name
        )
      `)
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setReviews(data as unknown as Review[]);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/auth");
      return;
    }
    if (product?.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product?.colors?.length && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    setAddingToCart(true);
    const success = await addToCart(product!.id, quantity, selectedSize, selectedColor);
    setAddingToCart(false);
    if (success) toast.success("Added to cart!");
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-secondary rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-6 bg-secondary rounded w-1/2" />
              <div className="h-20 bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountedPrice = product.price - (product.price * product.discount_percent) / 100;
  const savings = product.price - discountedPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-card rounded-xl overflow-hidden border border-border">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={product.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {product.discount_percent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg tarbo-gradient text-primary-foreground font-bold">
                  {product.discount_percent}% OFF
                </div>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isInWishlist(product.id)
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  }`}
                />
              </button>
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-primary font-medium mb-1">{product.brand || "TARBO STYLE"}</p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                {product.name}
              </h1>
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10">
                    <span className="font-semibold text-primary">{product.rating.toFixed(1)}</span>
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {product.review_count} ratings
                  </span>
                </div>
              )}
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">₹{Math.round(discountedPrice)}</span>
                {product.discount_percent > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">₹{product.price}</span>
                    <span className="text-primary font-semibold">Save ₹{Math.round(savings)}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Inclusive of all taxes</p>
            </div>

            {product.sizes?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                      }`}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedColor === color ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                      }`}>{color}</button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors disabled:opacity-50">
                <ShoppingCart className="h-5 w-5" />
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
            </div>

            {product.description && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-3">Product Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-xl font-display font-bold text-foreground mb-6">
            Customer Reviews
          </h2>

          <ReviewForm productId={product.id} onReviewSubmitted={fetchReviews} />

          <div className="mt-6">
            {reviews.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10">
                            <span className="text-sm font-semibold text-primary">{review.rating}</span>
                            <Star className="h-3 w-3 fill-primary text-primary" />
                          </div>
                          {review.is_verified && (
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <Check className="h-3 w-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        {review.title && <h4 className="font-medium mt-2">{review.title}</h4>}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}

                    {/* Review Media */}
                    {review.media_urls && review.media_urls.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {review.media_urls.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                            className="w-16 h-16 rounded-lg overflow-hidden border border-border block">
                            {url.match(/\.(mp4|webm|mov)$/i) ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="Review media" className="w-full h-full object-cover" />
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      By {review.profile?.full_name || "Anonymous"} •{" "}
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ProductDetails;
