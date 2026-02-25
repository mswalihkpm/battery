import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  MapPin, 
  Heart, 
  Package, 
  LogOut, 
  ChevronRight, 
  Settings as SettingsIcon,
  Shield,
  Headphones,
  Mail,
  Phone,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  ScrollText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(`Switched to ${newIsDark ? "dark" : "light"} mode`);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const menuItems = [
    { icon: User, label: "Profile", description: "View and edit your profile", onClick: () => navigate("/settings/profile") },
    { icon: MapPin, label: "Addresses", description: "Manage delivery addresses", onClick: () => navigate("/settings/addresses") },
    { icon: Heart, label: "Wishlist", description: "View saved items", onClick: () => navigate("/wishlist") },
    { icon: Package, label: "Orders", description: "Track your orders", onClick: () => navigate("/orders") },
  ];

  const customerServiceItems = [
    { icon: Headphones, label: "Help Center", description: "FAQs and guides", onClick: () => navigate("/faq") },
    { icon: Mail, label: "Email Support", description: "tarbo.style.12@gmail.com", onClick: () => window.location.href = "mailto:tarbo.style.12@gmail.com" },
    { icon: Phone, label: "Contact Us", description: "9744942515", onClick: () => window.location.href = "tel:+919744942515" },
  ];

  const legalItems = [
    { icon: HelpCircle, label: "FAQ", description: "Frequently asked questions", onClick: () => navigate("/faq") },
    { icon: ScrollText, label: "Privacy Policy", description: "How we handle your data", onClick: () => navigate("/privacy-policy") },
    { icon: FileText, label: "Terms & Conditions", description: "Our terms of service", onClick: () => navigate("/terms") },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/4 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-secondary rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderMenuGroup = (title: string, items: typeof menuItems, startDelay = 0) => (
    <div className="space-y-3 mb-6">
      <h3 className="text-sm font-medium text-muted-foreground px-1">{title}</h3>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.label}
            onClick={item.onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + startDelay) * 0.05 }}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium">{item.label}</span>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">Settings</h1>

        {/* Theme Toggle */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <span className="font-medium">Theme</span>
                <p className="text-sm text-muted-foreground">{isDarkMode ? "Dark mode" : "Light mode"}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${isDarkMode ? "bg-primary" : "bg-secondary"}`}
            >
              <motion.div
                initial={false}
                animate={{ x: isDarkMode ? 28 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </div>

        {user ? (
          <>
            {/* User Info */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{user.email}</h2>
                  <p className="text-sm text-muted-foreground">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {renderMenuGroup("Account", menuItems)}
            {renderMenuGroup("Customer Service", customerServiceItems, menuItems.length)}
            {renderMenuGroup("Legal", legalItems, menuItems.length + customerServiceItems.length)}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 p-4 bg-destructive/10 rounded-xl border border-destructive/20 hover:bg-destructive/20 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-medium text-destructive">Sign Out</span>
            </button>

            {/* Hidden Admin */}
            <div className="mt-12 pt-6 border-t border-border">
              <button onClick={() => setShowAdminLink(!showAdminLink)} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <SettingsIcon className="h-3 w-3 inline mr-1" />Advanced
              </button>
              {showAdminLink && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                  <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Shield className="h-4 w-4" />Admin Dashboard
                  </button>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <>
            {renderMenuGroup("Customer Service", customerServiceItems)}
            {renderMenuGroup("Legal", legalItems, customerServiceItems.length)}
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to continue</h2>
              <p className="text-muted-foreground mb-6">Access your profile, orders, and more</p>
              <button onClick={() => navigate("/auth")} className="px-6 py-3 tarbo-gradient text-primary-foreground rounded-lg font-medium">Sign In</button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
