import { useState, useEffect } from "react";
import { Shirt, Watch, Baby, Footprints, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const categoryIcons: Record<string, any> = {
  mens: Shirt,
  kids: Baby,
  accessories: Watch,
  footwear: Footprints,
};

const categoryColors: Record<string, string> = {
  mens: "from-emerald-500 to-emerald-700",
  kids: "from-green-400 to-green-600",
  accessories: "from-teal-500 to-teal-700",
  footwear: "from-lime-500 to-lime-700",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

const CategoryNav = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("sort_order");
    if (data) setCategories(data);
  };

  const parentCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  const handleCategoryClick = (cat: Category) => {
    const subs = getSubcategories(cat.id);
    if (subs.length > 0) {
      setExpandedCategory(expandedCategory === cat.slug ? null : cat.slug);
    } else {
      navigate(`/products?category=${cat.slug}`);
      toast.success(`Browsing ${cat.name} collection`);
    }
  };

  const handleSubcategoryClick = (sub: Category) => {
    navigate(`/products?category=${sub.slug}`);
    toast.success(`Browsing ${sub.name}`);
    setExpandedCategory(null);
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center gap-8 py-3">
          {parentCategories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Shirt;
            const color = categoryColors[cat.slug] || "from-emerald-500 to-emerald-700";
            const subs = getSubcategories(cat.id);
            return (
              <div key={cat.id} className="relative group">
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 shadow-tarbo`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    {cat.name}
                    {subs.length > 0 && <ChevronDown className="h-3 w-3" />}
                  </span>
                </button>
                {/* Desktop dropdown */}
                {subs.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card rounded-xl border border-border shadow-tarbo-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="py-2">
                      <button
                        onClick={() => { navigate(`/products?category=${cat.slug}`); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors font-medium text-primary"
                      >
                        All {cat.name}
                      </button>
                      {subs.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(sub)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-6 py-3 px-4 min-w-max">
              {parentCategories.map((cat) => {
                const Icon = categoryIcons[cat.slug] || Shirt;
                const color = categoryColors[cat.slug] || "from-emerald-500 to-emerald-700";
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color} group-active:scale-95 transition-transform shadow-tarbo`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground flex items-center gap-0.5">
                      {cat.name}
                      {getSubcategories(cat.id).length > 0 && <ChevronDown className="h-2.5 w-2.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Mobile expanded subcategories */}
          <AnimatePresence>
            {expandedCategory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="flex flex-wrap gap-2 px-4 py-3">
                  {(() => {
                    const parent = parentCategories.find(c => c.slug === expandedCategory);
                    if (!parent) return null;
                    const subs = getSubcategories(parent.id);
                    return (
                      <>
                        <button
                          onClick={() => { navigate(`/products?category=${parent.slug}`); setExpandedCategory(null); }}
                          className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                        >
                          All {parent.name}
                        </button>
                        {subs.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(sub)}
                            className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
