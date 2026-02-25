import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, Menu, X, LogOut, Settings, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import tarboLogo from "@/assets/tarbo-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isAdminShift, setIsAdminShift] = useState(false);

  useEffect(() => {
    setIsAdminShift(localStorage.getItem("admin_shift") === "true");
  }, []);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full tarbo-glass border-b border-border">
      <div className="container mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={tarboLogo} alt="TARBO STYLE" className="h-12 w-auto" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-foreground">TARBO</span>
              <span className="text-xs font-medium text-primary -mt-1">STYLE</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 pr-4 rounded-xl bg-secondary border-none outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/orders" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Orders</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                <User className="h-5 w-5" />
                <span className="font-medium">Login</span>
              </Link>
            )}
            <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">{wishlistCount}</span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">{cartCount}</span>
              )}
            </Link>
            <Link to="/settings" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Settings">
              <Settings className="h-5 w-5" />
            </Link>
            {isAdminShift && (
              <button
                onClick={() => { localStorage.removeItem("admin_shift"); navigate("/admin"); }}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                title="Back to Admin"
              >
                <Shield className="h-5 w-5 text-primary" />
              </button>
            )}
          </div>
        </div>
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-14 px-2">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="flex items-center gap-1">
              <img src={tarboLogo} alt="TARBO STYLE" className="h-8 w-auto" />
              <span className="font-display text-lg font-bold text-foreground">TARBO</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">{wishlistCount}</span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">{cartCount}</span>
                )}
              </Link>
              <Link to="/settings" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Settings">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <form onSubmit={handleSearch} className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-none outline-none focus:ring-2 focus:ring-primary text-sm text-foreground placeholder:text-muted-foreground transition-all" />
            </div>
          </form>
              {isAdminShift && (
                <button
                  onClick={() => { localStorage.removeItem("admin_shift"); navigate("/admin"); }}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  title="Back to Admin"
                >
                  <Shield className="h-4 w-4 text-primary" />
                </button>
              )}
            </div>
          </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-card border-t border-border overflow-hidden">
            <nav className="container py-4 space-y-2">
              {["Mens", "Kids", "Accessories", "Footwear"].map((item) => (
                <Link key={item} to={`/products?category=${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="block w-full text-left py-3 px-4 rounded-lg hover:bg-secondary font-medium transition-colors">
                  {item}
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                {user ? (
                  <>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-secondary transition-colors">
                      <User className="h-5 w-5" />
                      <span className="font-medium">My Orders</span>
                    </Link>
                    <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-secondary transition-colors text-destructive">
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-secondary transition-colors">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Login / Register</span>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
