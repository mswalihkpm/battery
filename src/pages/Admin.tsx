import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, Package, FolderTree, ShoppingBag, Megaphone, Palette,
  Plus, Edit, Trash2, Save, X, ArrowLeft, Image as ImageIcon, Loader2, Search, Lock, Eye, EyeOff,
  Settings, LogOut, ArrowRightLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import ImageUploader from "@/components/admin/ImageUploader";
import AdImageUploader from "@/components/admin/AdImageUploader";

interface Product {
  id: string;
  name: string;
  price: number;
  discount_percent: number | null;
  brand: string | null;
  stock: number | null;
  is_active: boolean | null;
  category_id: string | null;
  images: string[] | null;
  description: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  product_number: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number | null;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  order_status: string | null;
  payment_status: string | null;
  payment_method: string;
}

interface Advertisement {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

interface AppTheme {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  bg_color: string;
  banner_text: string | null;
  banner_emoji: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders" | "advertisements" | "themes">("products");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [themes, setThemes] = useState<AppTheme[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddAd, setShowAddAd] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [productSearch, setProductSearch] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "", price: 0, discount_percent: 0, brand: "", stock: 0, category_id: "",
    images: [] as string[], description: "", sizes: "", colors: "",
  });

  const [newCategory, setNewCategory] = useState({ name: "", slug: "", parent_id: "", sort_order: 0 });

  const [newAd, setNewAd] = useState({
    title: "", subtitle: "", cta_text: "Shop Now", cta_link: "/products",
    image_url: "", gradient_from: "#059669", gradient_to: "#10b981", sort_order: 0,
  });

  // Close settings menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAdminAccess = () => {
      const hasAccess = sessionStorage.getItem("admin_access") === "true";
      if (hasAccess) {
        setIsAdmin(true);
        fetchData();
      } else {
        setIsAdmin(false);
      }
      setCheckingRole(false);
    };
    checkAdminAccess();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, categoriesRes, ordersRes, adsRes, themesRes] = await Promise.all([
      supabase.from("products").select("id, name, price, discount_percent, brand, stock, is_active, category_id, images, description, sizes, colors, product_number").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("orders").select("id, created_at, total, order_status, payment_status, payment_method").order("created_at", { ascending: false }),
      supabase.from("advertisements").select("*").order("sort_order"),
      supabase.from("app_themes").select("*").order("name"),
    ]);
    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (adsRes.data) setAdvertisements(adsRes.data);
    if (themesRes.data) setThemes(themesRes.data as AppTheme[]);
    setLoading(false);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) { toast.error("Name and price are required"); return; }
    const sizesArray = newProduct.sizes ? newProduct.sizes.split(",").map(s => s.trim()).filter(Boolean) : [];
    const colorsArray = newProduct.colors ? newProduct.colors.split(",").map(c => c.trim()).filter(Boolean) : [];
    const { error } = await supabase.from("products").insert({
      name: newProduct.name, price: newProduct.price, discount_percent: newProduct.discount_percent || 0,
      brand: newProduct.brand || null, stock: newProduct.stock || 0, category_id: newProduct.category_id || null,
      is_active: true, images: newProduct.images, description: newProduct.description || null,
      sizes: sizesArray, colors: colorsArray,
    });
    if (error) { toast.error("Failed to add product: " + error.message); return; }
    toast.success("Product added");
    setShowAddProduct(false);
    setNewProduct({ name: "", price: 0, discount_percent: 0, brand: "", stock: 0, category_id: "", images: [], description: "", sizes: "", colors: "" });
    fetchData();
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    const { error } = await supabase.from("products").update({
      name: editingProduct.name, price: editingProduct.price, discount_percent: editingProduct.discount_percent,
      brand: editingProduct.brand, stock: editingProduct.stock, is_active: editingProduct.is_active,
      category_id: editingProduct.category_id, images: editingProduct.images, description: editingProduct.description,
      sizes: editingProduct.sizes, colors: editingProduct.colors,
    }).eq("id", editingProduct.id);
    if (error) { toast.error("Failed to update product: " + error.message); return; }
    toast.success("Product updated"); setEditingProduct(null); fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete product: " + error.message); return; }
    toast.success("Product deleted"); fetchData();
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) { toast.error("Name and slug are required"); return; }
    const { error } = await supabase.from("categories").insert({
      name: newCategory.name, slug: newCategory.slug, parent_id: newCategory.parent_id || null, sort_order: newCategory.sort_order || 0,
    });
    if (error) { toast.error("Failed to add category: " + error.message); return; }
    toast.success("Category added"); setShowAddCategory(false);
    setNewCategory({ name: "", slug: "", parent_id: "", sort_order: 0 }); fetchData();
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    const { error } = await supabase.from("categories").update({
      name: editingCategory.name, slug: editingCategory.slug, parent_id: editingCategory.parent_id, sort_order: editingCategory.sort_order,
    }).eq("id", editingCategory.id);
    if (error) { toast.error("Failed to update category: " + error.message); return; }
    toast.success("Category updated"); setEditingCategory(null); fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error("Failed to delete category: " + error.message); return; }
    toast.success("Category deleted"); fetchData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (status === "confirmed") {
      const { data: orderItems } = await supabase
        .from("order_items").select("product_id, quantity").eq("order_id", orderId);
      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_id) {
            const { data: prod } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
            if (prod) {
              const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
              await supabase.from("products").update({ stock: newStock }).eq("id", item.product_id);
            }
          }
        }
      }
    }
    const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", orderId);
    if (error) { toast.error("Failed to update order: " + error.message); return; }
    toast.success(`Order ${status === "confirmed" ? "confirmed & stock updated" : "status updated"}`); fetchData();
  };

  const handleAddAdvertisement = async () => {
    if (!newAd.title) { toast.error("Title is required"); return; }
    const { error } = await supabase.from("advertisements").insert({
      title: newAd.title, subtitle: newAd.subtitle || null, cta_text: newAd.cta_text || "Shop Now",
      cta_link: newAd.cta_link || "/products", image_url: newAd.image_url || null,
      gradient_from: newAd.gradient_from || "#059669", gradient_to: newAd.gradient_to || "#10b981",
      sort_order: newAd.sort_order || 0, is_active: true,
    });
    if (error) { toast.error("Failed to add advertisement: " + error.message); return; }
    toast.success("Advertisement added"); setShowAddAd(false);
    setNewAd({ title: "", subtitle: "", cta_text: "Shop Now", cta_link: "/products", image_url: "", gradient_from: "#059669", gradient_to: "#10b981", sort_order: 0 });
    fetchData();
  };

  const handleUpdateAdvertisement = async () => {
    if (!editingAd) return;
    const { error } = await supabase.from("advertisements").update({
      title: editingAd.title, subtitle: editingAd.subtitle, cta_text: editingAd.cta_text,
      cta_link: editingAd.cta_link, image_url: editingAd.image_url, gradient_from: editingAd.gradient_from,
      gradient_to: editingAd.gradient_to, sort_order: editingAd.sort_order, is_active: editingAd.is_active,
    }).eq("id", editingAd.id);
    if (error) { toast.error("Failed to update advertisement: " + error.message); return; }
    toast.success("Advertisement updated"); setEditingAd(null); fetchData();
  };

  const handleDeleteAdvertisement = async (id: string) => {
    const { error } = await supabase.from("advertisements").delete().eq("id", id);
    if (error) { toast.error("Failed to delete advertisement: " + error.message); return; }
    toast.success("Advertisement deleted"); fetchData();
  };

  const handleToggleAdStatus = async (ad: Advertisement) => {
    const { error } = await supabase.from("advertisements").update({ is_active: !ad.is_active }).eq("id", ad.id);
    if (error) { toast.error("Failed to update advertisement: " + error.message); return; }
    toast.success(`Advertisement ${ad.is_active ? "deactivated" : "activated"}`); fetchData();
  };

  const handleActivateTheme = async (themeId: string) => {
    await supabase.from("app_themes").update({ is_active: false } as any).neq("id", "");
    const { error } = await supabase.from("app_themes").update({ is_active: true } as any).eq("id", themeId);
    if (error) { toast.error("Failed to activate theme"); return; }
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty("--primary", theme.primary_color);
      document.documentElement.style.setProperty("--tarbo-green", theme.primary_color);
      document.documentElement.style.setProperty("--tarbo-green-dark", theme.primary_dark);
      document.documentElement.style.setProperty("--tarbo-green-light", theme.accent_color);
      document.documentElement.style.setProperty("--accent", theme.primary_color);
      document.documentElement.style.setProperty("--ring", theme.primary_color);
      localStorage.setItem("app_theme", JSON.stringify(theme));
    }
    toast.success(`Theme "${theme?.name}" activated!`); fetchData();
  };

  const handleDeactivateTheme = async (themeId: string) => {
    const { error } = await supabase.from("app_themes").update({ is_active: false } as any).eq("id", themeId);
    if (error) { toast.error("Failed to deactivate theme"); return; }
    // Reset to default theme
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--tarbo-green");
    document.documentElement.style.removeProperty("--tarbo-green-dark");
    document.documentElement.style.removeProperty("--tarbo-green-light");
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--ring");
    localStorage.removeItem("app_theme");
    toast.success("Theme deactivated, reverted to default"); fetchData();
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error("Failed to change password: " + error.message); }
    else { toast.success("Password changed successfully"); setShowChangePassword(false); setNewPassword(""); setConfirmPassword(""); }
    setChangingPw(false);
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("admin_access");
    navigate("/");
  };

  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    const search = productSearch.toLowerCase();
    const pnMatch = p.product_number?.toString() === productSearch;
    const nameMatch = p.name.toLowerCase().includes(search);
    return pnMatch || nameMatch;
  });

  // CTA link presets for ads
  const ctaLinkPresets = [
    { label: "All Products", value: "/products" },
    ...categories.map(c => ({ label: `${c.parent_id ? "  └ " : ""}${c.name}`, value: `/products?category=${c.slug}` })),
  ];

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-2xl border border-border p-8 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin access to view this page.</p>
          <button onClick={() => navigate("/")} className="w-full py-3 tarbo-gradient text-primary-foreground rounded-lg font-semibold">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            {/* Shift to customer view */}
            <button
              onClick={() => {
                localStorage.setItem("admin_shift", "true");
                navigate("/");
              }}
              title="Switch to Customer View"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            {/* Settings dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  <button onClick={() => { setShowChangePassword(true); setShowSettingsMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2">
                    <Lock className="h-4 w-4" />Change Password
                  </button>
                  <button onClick={() => { setActiveTab("themes"); setShowSettingsMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2">
                    <Palette className="h-4 w-4" />Themes
                  </button>
                  <button onClick={() => { setActiveTab("categories"); setShowSettingsMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />Add Category
                  </button>
                  <div className="border-t border-border my-1" />
                  <button onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - scrollable on mobile */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "products", label: "Products", icon: Package },
            { key: "categories", label: "Categories", icon: FolderTree },
            { key: "orders", label: "Orders", icon: ShoppingBag },
            { key: "advertisements", label: "Ads", icon: Megaphone },
            { key: "themes", label: "Themes", icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-xs sm:text-sm ${
                  activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl border border-border p-6 w-full max-w-sm space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Lock className="h-5 w-5" />Change Password</h3>
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} placeholder="New Password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input type="password" placeholder="Confirm Password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex gap-3">
                <button onClick={handleChangePassword} disabled={changingPw}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">
                  {changingPw ? "Updating..." : "Update Password"}
                </button>
                <button onClick={() => { setShowChangePassword(false); setNewPassword(""); setConfirmPassword(""); }}
                  className="flex-1 py-2 border border-border rounded-lg">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary rounded-lg" />)}
          </div>
        ) : (
          <>
            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button onClick={() => setShowAddProduct(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                    <Plus className="h-4 w-4" />Add Product
                  </button>
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search by product # or name..."
                      value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                </div>

                {showAddProduct && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base">Add New Product</h3>
                    <ImageUploader images={newProduct.images} onImagesChange={(images) => setNewProduct(prev => ({ ...prev, images }))} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Product Name *" value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="number" placeholder="Price *" value={newProduct.price || ""}
                        onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="number" placeholder="Discount %" value={newProduct.discount_percent || ""}
                        onChange={e => setNewProduct({ ...newProduct, discount_percent: Number(e.target.value) })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="text" placeholder="Brand" value={newProduct.brand}
                        onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="number" placeholder="Stock" value={newProduct.stock || ""}
                        onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <select value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm">
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.parent_id ? "  └ " : ""}{cat.name}</option>)}
                      </select>
                      <input type="text" placeholder="Sizes (comma separated)" value={newProduct.sizes}
                        onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="text" placeholder="Colors (comma separated)" value={newProduct.colors}
                        onChange={e => setNewProduct({ ...newProduct, colors: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <textarea placeholder="Product Description" value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary rounded-lg border border-border min-h-[80px] outline-none focus:ring-2 focus:ring-primary text-sm" />
                    <div className="flex gap-2">
                      <button onClick={handleAddProduct} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                        <Save className="h-4 w-4 inline mr-1" />Save
                      </button>
                      <button onClick={() => setShowAddProduct(false)} className="px-4 py-2 border border-border rounded-lg text-sm">
                        <X className="h-4 w-4 inline mr-1" />Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Products - Card layout on mobile, table on desktop */}
                <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">#</th>
                          <th className="text-left p-3 text-sm font-medium">Image</th>
                          <th className="text-left p-3 text-sm font-medium">Name</th>
                          <th className="text-left p-3 text-sm font-medium">Price</th>
                          <th className="text-left p-3 text-sm font-medium">Discount</th>
                          <th className="text-left p-3 text-sm font-medium">Stock</th>
                          <th className="text-left p-3 text-sm font-medium">Status</th>
                          <th className="text-left p-3 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="border-t border-border">
                            <td className="p-3 text-sm font-mono text-muted-foreground">{product.product_number || "—"}</td>
                            <td className="p-3">
                              {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                              ) : (
                                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-sm">{product.name}</td>
                            <td className="p-3 text-sm">₹{product.price}</td>
                            <td className="p-3 text-sm">{product.discount_percent || 0}%</td>
                            <td className="p-3 text-sm">{product.stock || 0}</td>
                            <td className="p-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${product.is_active ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3 text-sm">
                              <div className="flex gap-2">
                                <button onClick={() => setEditingProduct(product)} className="p-1 hover:bg-secondary rounded"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-1 hover:bg-destructive/20 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile product cards */}
                <div className="md:hidden space-y-3">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-card rounded-xl border border-border p-3 flex gap-3">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">#{product.product_number || "—"}</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] flex-shrink-0 ${product.is_active ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                            {product.is_active ? "Active" : "Off"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="text-xs space-x-2">
                            <span className="font-medium">₹{product.price}</span>
                            {(product.discount_percent || 0) > 0 && <span className="text-primary">{product.discount_percent}% off</span>}
                            <span className="text-muted-foreground">Stock: {product.stock || 0}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingProduct(product)} className="p-1.5 hover:bg-secondary rounded"><Edit className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 hover:bg-destructive/20 rounded text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-4">
                <button onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                  <Plus className="h-4 w-4" />Add Category
                </button>
                {showAddCategory && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base">Add New Category</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Category Name *" value={newCategory.name}
                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="text" placeholder="Slug *" value={newCategory.slug}
                        onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <select value={newCategory.parent_id} onChange={e => setNewCategory({ ...newCategory, parent_id: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm">
                        <option value="">No Parent (Top Level)</option>
                        {categories.filter(c => !c.parent_id).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <input type="number" placeholder="Sort Order" value={newCategory.sort_order || ""}
                        onChange={e => setNewCategory({ ...newCategory, sort_order: Number(e.target.value) })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                        <Save className="h-4 w-4 inline mr-1" />Save
                      </button>
                      <button onClick={() => setShowAddCategory(false)} className="px-4 py-2 border border-border rounded-lg text-sm">
                        <X className="h-4 w-4 inline mr-1" />Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
                {/* Desktop table */}
                <div className="hidden sm:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Name</th>
                          <th className="text-left p-3 text-sm font-medium">Slug</th>
                          <th className="text-left p-3 text-sm font-medium">Parent</th>
                          <th className="text-left p-3 text-sm font-medium">Order</th>
                          <th className="text-left p-3 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.id} className="border-t border-border">
                            <td className="p-3 text-sm">{cat.parent_id ? "  └ " : ""}{cat.name}</td>
                            <td className="p-3 text-sm text-muted-foreground">{cat.slug}</td>
                            <td className="p-3 text-sm text-muted-foreground">{cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name || "—" : "—"}</td>
                            <td className="p-3 text-sm">{cat.sort_order}</td>
                            <td className="p-3 text-sm">
                              <div className="flex gap-2">
                                <button onClick={() => setEditingCategory(cat)} className="p-1 hover:bg-secondary rounded"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-destructive/20 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-card rounded-lg border border-border p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{cat.parent_id ? "└ " : ""}{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.slug} {cat.parent_id ? `• Parent: ${categories.find(c => c.id === cat.parent_id)?.name}` : ""}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingCategory(cat)} className="p-1.5 hover:bg-secondary rounded"><Edit className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 hover:bg-destructive/20 rounded text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                {/* Desktop table */}
                <div className="hidden sm:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Order ID</th>
                          <th className="text-left p-3 text-sm font-medium">Date</th>
                          <th className="text-left p-3 text-sm font-medium">Total</th>
                          <th className="text-left p-3 text-sm font-medium">Payment</th>
                          <th className="text-left p-3 text-sm font-medium">Status</th>
                          <th className="text-left p-3 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-t border-border">
                            <td className="p-3 text-sm font-mono">{order.id.slice(0, 8)}...</td>
                            <td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-sm font-medium">₹{Math.round(Number(order.total))}</td>
                            <td className="p-3 text-sm capitalize">{order.payment_method}</td>
                            <td className="p-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs capitalize ${
                                order.order_status === "delivered" ? "bg-green-500/20 text-green-600" :
                                order.order_status === "shipped" ? "bg-blue-500/20 text-blue-600" :
                                order.order_status === "confirmed" ? "bg-emerald-500/20 text-emerald-600" :
                                order.order_status === "cancelled" ? "bg-red-500/20 text-red-600" :
                                "bg-yellow-500/20 text-yellow-600"
                              }`}>{order.order_status || "placed"}</span>
                            </td>
                            <td className="p-3 text-sm">
                              <select value={order.order_status || "placed"}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="px-2 py-1 bg-secondary rounded border border-border text-xs">
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-card rounded-xl border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}...</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] capitalize ${
                          order.order_status === "delivered" ? "bg-green-500/20 text-green-600" :
                          order.order_status === "shipped" ? "bg-blue-500/20 text-blue-600" :
                          order.order_status === "confirmed" ? "bg-emerald-500/20 text-emerald-600" :
                          order.order_status === "cancelled" ? "bg-red-500/20 text-red-600" :
                          "bg-yellow-500/20 text-yellow-600"
                        }`}>{order.order_status || "placed"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">₹{Math.round(Number(order.total))}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} • {order.payment_method}</p>
                        </div>
                        <select value={order.order_status || "placed"}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-2 py-1 bg-secondary rounded border border-border text-xs">
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advertisements Tab */}
            {activeTab === "advertisements" && (
              <div className="space-y-4">
                <button onClick={() => setShowAddAd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                  <Plus className="h-4 w-4" />Add Advertisement
                </button>
                {showAddAd && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-4">
                    <h3 className="font-semibold text-sm sm:text-base">Add New Advertisement</h3>
                    <AdImageUploader imageUrl={newAd.image_url} onImageChange={url => setNewAd(prev => ({ ...prev, image_url: url }))} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Title *" value={newAd.title} onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="text" placeholder="Subtitle" value={newAd.subtitle} onChange={e => setNewAd({ ...newAd, subtitle: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <input type="text" placeholder="CTA Text" value={newAd.cta_text} onChange={e => setNewAd({ ...newAd, cta_text: e.target.value })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <div>
                        <select value={newAd.cta_link} onChange={e => setNewAd({ ...newAd, cta_link: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm">
                          {ctaLinkPresets.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                      <input type="number" placeholder="Sort Order" value={newAd.sort_order || ""} onChange={e => setNewAd({ ...newAd, sort_order: Number(e.target.value) })}
                        className="px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" />
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">From</label>
                          <input type="color" value={newAd.gradient_from} onChange={e => setNewAd({ ...newAd, gradient_from: e.target.value })}
                            className="w-full px-1 py-1 bg-secondary rounded-lg border border-border h-10" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">To</label>
                          <input type="color" value={newAd.gradient_to} onChange={e => setNewAd({ ...newAd, gradient_to: e.target.value })}
                            className="w-full px-1 py-1 bg-secondary rounded-lg border border-border h-10" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddAdvertisement} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                        <Save className="h-4 w-4 inline mr-1" />Save
                      </button>
                      <button onClick={() => setShowAddAd(false)} className="px-4 py-2 border border-border rounded-lg text-sm">
                        <X className="h-4 w-4 inline mr-1" />Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
                {/* Desktop table */}
                <div className="hidden sm:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Image</th>
                          <th className="text-left p-3 text-sm font-medium">Title</th>
                          <th className="text-left p-3 text-sm font-medium">CTA</th>
                          <th className="text-left p-3 text-sm font-medium">Link</th>
                          <th className="text-left p-3 text-sm font-medium">Order</th>
                          <th className="text-left p-3 text-sm font-medium">Status</th>
                          <th className="text-left p-3 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {advertisements.map(ad => (
                          <tr key={ad.id} className="border-t border-border">
                            <td className="p-3">
                              {ad.image_url ? <img src={ad.image_url} alt={ad.title} className="w-16 h-9 object-cover rounded" /> :
                                <div className="w-16 h-9 rounded" style={{ background: `linear-gradient(135deg, ${ad.gradient_from}, ${ad.gradient_to})` }} />}
                            </td>
                            <td className="p-3 text-sm">{ad.title}</td>
                            <td className="p-3 text-sm">{ad.cta_text}</td>
                            <td className="p-3 text-sm text-muted-foreground">{ad.cta_link}</td>
                            <td className="p-3 text-sm">{ad.sort_order}</td>
                            <td className="p-3 text-sm">
                              <button onClick={() => handleToggleAdStatus(ad)}
                                className={`px-2 py-1 rounded text-xs ${ad.is_active ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                                {ad.is_active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="p-3 text-sm">
                              <div className="flex gap-2">
                                <button onClick={() => setEditingAd(ad)} className="p-1 hover:bg-secondary rounded"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDeleteAdvertisement(ad.id)} className="p-1 hover:bg-destructive/20 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {advertisements.map(ad => (
                    <div key={ad.id} className="bg-card rounded-xl border border-border p-3 space-y-2">
                      <div className="flex gap-3">
                        {ad.image_url ? <img src={ad.image_url} alt={ad.title} className="w-20 h-12 object-cover rounded flex-shrink-0" /> :
                          <div className="w-20 h-12 rounded flex-shrink-0" style={{ background: `linear-gradient(135deg, ${ad.gradient_from}, ${ad.gradient_to})` }} />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ad.title}</p>
                          <p className="text-xs text-muted-foreground">{ad.cta_text} → {ad.cta_link}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => handleToggleAdStatus(ad)}
                          className={`px-2 py-1 rounded text-xs ${ad.is_active ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                          {ad.is_active ? "Active" : "Inactive"}
                        </button>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingAd(ad)} className="p-1.5 hover:bg-secondary rounded"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDeleteAdvertisement(ad.id)} className="p-1.5 hover:bg-destructive/20 rounded text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Themes Tab */}
            {activeTab === "themes" && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground">Select a theme to change the entire app appearance. Perfect for seasonal celebrations!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {themes.map(theme => (
                    <motion.div key={theme.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`bg-card rounded-xl border-2 p-3 sm:p-4 transition-colors ${theme.is_active ? "border-primary" : "border-border"}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, hsl(${theme.primary_color}), hsl(${theme.primary_dark}))` }} />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{theme.banner_emoji} {theme.name}</h3>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{theme.description}</p>
                        </div>
                      </div>
                      {theme.banner_text && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground bg-secondary rounded-lg p-2 mb-3 truncate">{theme.banner_text}</p>
                      )}
                      <div className="flex gap-2 mb-3">
                        <div className="h-5 sm:h-6 flex-1 rounded" style={{ background: `hsl(${theme.primary_color})` }} />
                        <div className="h-5 sm:h-6 flex-1 rounded" style={{ background: `hsl(${theme.primary_dark})` }} />
                        <div className="h-5 sm:h-6 flex-1 rounded" style={{ background: `hsl(${theme.accent_color})` }} />
                      </div>
                      {theme.is_active ? (
                        <button
                          onClick={() => handleDeactivateTheme(theme.id)}
                          className="w-full py-2 rounded-lg font-medium text-xs sm:text-sm bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
                          ✓ Active — Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateTheme(theme.id)}
                          className="w-full py-2 rounded-lg font-medium text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                          Apply Theme
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl border border-border p-4 sm:p-6 w-full max-w-2xl space-y-4 my-4 sm:my-8">
              <h3 className="font-semibold text-base sm:text-lg">Edit Product <span className="text-muted-foreground font-mono text-sm">#{editingProduct.product_number}</span></h3>
              <ImageUploader images={editingProduct.images || []} onImagesChange={images => setEditingProduct(prev => prev ? { ...prev, images } : null)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Name" />
                <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Price" />
                <input type="number" value={editingProduct.discount_percent || 0} onChange={e => setEditingProduct({ ...editingProduct, discount_percent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Discount %" />
                <input type="text" value={editingProduct.brand || ""} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Brand" />
                <input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Stock" />
                <select value={editingProduct.category_id || ""} onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.parent_id ? "  └ " : ""}{cat.name}</option>)}
                </select>
                <input type="text" value={editingProduct.sizes?.join(", ") || ""}
                  onChange={e => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Sizes (comma separated)" />
                <input type="text" value={editingProduct.colors?.join(", ") || ""}
                  onChange={e => setEditingProduct({ ...editingProduct, colors: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Colors (comma separated)" />
              </div>
              <textarea value={editingProduct.description || ""} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border min-h-[80px] outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Description" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingProduct.is_active ?? true}
                  onChange={e => setEditingProduct({ ...editingProduct, is_active: e.target.checked })} className="rounded" />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex gap-3">
                <button onClick={handleUpdateProduct} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">Save Changes</button>
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-2 border border-border rounded-lg text-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl border border-border p-4 sm:p-6 w-full max-w-md space-y-4">
              <h3 className="font-semibold text-base sm:text-lg">Edit Category</h3>
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Name" />
              <input type="text" value={editingCategory.slug} onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Slug" />
              <select value={editingCategory.parent_id || ""} onChange={e => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="">No Parent (Top Level)</option>
                {categories.filter(c => !c.parent_id && c.id !== editingCategory.id).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <input type="number" value={editingCategory.sort_order || 0} onChange={e => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Sort Order" />
              <div className="flex gap-3">
                <button onClick={handleUpdateCategory} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">Save Changes</button>
                <button onClick={() => setEditingCategory(null)} className="flex-1 py-2 border border-border rounded-lg text-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Ad Modal */}
        {editingAd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl border border-border p-4 sm:p-6 w-full max-w-lg space-y-4 my-4 sm:my-8">
              <h3 className="font-semibold text-base sm:text-lg">Edit Advertisement</h3>
              <AdImageUploader imageUrl={editingAd.image_url || ""} onImageChange={url => setEditingAd(prev => prev ? { ...prev, image_url: url } : null)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={editingAd.title} onChange={e => setEditingAd({ ...editingAd, title: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Title" />
                <input type="text" value={editingAd.subtitle || ""} onChange={e => setEditingAd({ ...editingAd, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Subtitle" />
                <input type="text" value={editingAd.cta_text || ""} onChange={e => setEditingAd({ ...editingAd, cta_text: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="CTA Text" />
                <select value={editingAd.cta_link || "/products"} onChange={e => setEditingAd({ ...editingAd, cta_link: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm">
                  {ctaLinkPresets.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <input type="number" value={editingAd.sort_order || 0} onChange={e => setEditingAd({ ...editingAd, sort_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Sort Order" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Gradient From</label>
                  <input type="color" value={editingAd.gradient_from || "#059669"} onChange={e => setEditingAd({ ...editingAd, gradient_from: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Gradient To</label>
                  <input type="color" value={editingAd.gradient_to || "#10b981"} onChange={e => setEditingAd({ ...editingAd, gradient_to: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingAd.is_active ?? true} onChange={e => setEditingAd({ ...editingAd, is_active: e.target.checked })} className="rounded" />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex gap-3">
                <button onClick={handleUpdateAdvertisement} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">Save Changes</button>
                <button onClick={() => setEditingAd(null)} className="flex-1 py-2 border border-border rounded-lg text-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
