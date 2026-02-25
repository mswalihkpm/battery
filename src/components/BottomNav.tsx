import { Home, LayoutGrid, User, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  
  const handleCategories = () => {
    toast.info("Categories page coming soon!");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border tarbo-glass">
      <div className="flex items-center justify-around h-16">
        {/* Home */}
        <Link
          to="/"
          className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <Home className={`h-5 w-5 ${isActive("/") ? "stroke-[2.5]" : ""}`} />
          </div>
          <span className={`text-[10px] font-medium ${isActive("/") ? "font-semibold" : ""}`}>
            Home
          </span>
          {isActive("/") && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
          )}
        </Link>

        {/* Categories */}
        <button
          onClick={handleCategories}
          className="relative flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors"
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </button>

        {/* Account/Settings */}
        <Link
          to="/settings"
          className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isActive("/settings") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className={`h-5 w-5 ${isActive("/settings") ? "stroke-[2.5]" : ""}`} />
          <span className={`text-[10px] font-medium ${isActive("/settings") ? "font-semibold" : ""}`}>
            Account
          </span>
          {isActive("/settings") && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
          )}
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isActive("/cart") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`h-5 w-5 ${isActive("/cart") ? "stroke-[2.5]" : ""}`} />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
              {cartCount}
            </span>
          </div>
          <span className={`text-[10px] font-medium ${isActive("/cart") ? "font-semibold" : ""}`}>
            Cart
          </span>
          {isActive("/cart") && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
          )}
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
