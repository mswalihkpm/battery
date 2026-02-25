import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shirt, Watch, Baby, Footprints, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const showcaseItems = [
  {
    id: "mens",
    name: "Mens Fashion",
    description: "T-shirts, Shirts, Jeans & More",
    icon: Shirt,
    gradient: "from-emerald-600 to-emerald-800",
    items: ["T-shirts", "Shirts", "Jeans", "Trousers", "Trackpants"],
  },
  {
    id: "kids",
    name: "Kids Collection",
    description: "Trendy clothing for little ones",
    icon: Baby,
    gradient: "from-green-500 to-green-700",
    items: ["T-shirts", "Jeans", "Shorts", "Trackpants", "Innerwear"],
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Watches, Sunglasses, Wallets & More",
    icon: Watch,
    gradient: "from-teal-600 to-teal-800",
    items: ["Watches", "Sunglasses", "Wallets", "Belts", "Speakers", "Headphones"],
  },
  {
    id: "footwear",
    name: "Footwear",
    description: "Sports shoes, Casuals & Slippers",
    icon: Footprints,
    gradient: "from-lime-600 to-lime-800",
    items: ["Sports Shoes", "Casual Shoes", "Slippers", "Kids Sports Shoes"],
  },
];

const CategoryShowcase = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string, categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
    toast.success(`Exploring ${categoryName}`);
  };

  const handleViewAll = () => {
    navigate("/products");
  };

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
            Shop by Category
          </h2>
          <button
            onClick={handleViewAll}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {showcaseItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                id={item.id}
                onClick={() => handleCategoryClick(item.name, item.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 tarbo-shadow hover:shadow-tarbo-lg text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative p-4 md:p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {item.items.slice(0, 3).map((subItem) => (
                      <span
                        key={subItem}
                        className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {subItem}
                      </span>
                    ))}
                    {item.items.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                        +{item.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-tarbo-green-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
