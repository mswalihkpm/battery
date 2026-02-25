import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (item: typeof wishlistItems[0]) => {
    await addToCart(item.product_id);
  };

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view your wishlist</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite items and access them anytime
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <span className="text-muted-foreground">({wishlistItems.length} items)</span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding items you love to your wishlist
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {wishlistItems.map((item) => {
                const discountedPrice = calculateDiscountedPrice(
                  item.product.price,
                  item.product.discount_percent
                );

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-card rounded-lg overflow-hidden border shadow-sm group"
                  >
                    {/* Product Image */}
                    <Link to={`/product/${item.product_id}`}>
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        {item.product.discount_percent > 0 && (
                          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded">
                            {item.product.discount_percent}% OFF
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="p-3 space-y-2">
                      {item.product.brand && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {item.product.brand}
                        </p>
                      )}
                      <Link to={`/product/${item.product_id}`}>
                        <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          ₹{Math.round(discountedPrice)}
                        </span>
                        {item.product.discount_percent > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.product.price}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {item.product.rating && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                            ★ {item.product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-2"
                          onClick={() => handleRemove(item.product_id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Wishlist;
