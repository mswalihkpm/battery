import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ShopItem {
  id: string;
  name: string;
  image: string;
  slug: string;
}

const shopItems: ShopItem[] = [
  {
    id: "tshirts",
    name: "T-Shirts",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80",
    slug: "t-shirts",
  },
  {
    id: "shirts",
    name: "Shirts",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=80",
    slug: "shirts",
  },
  {
    id: "watches",
    name: "Watches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80",
    slug: "watches",
  },
  {
    id: "sports-shoes",
    name: "Sports Shoes",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&q=80",
    slug: "sports-shoes",
  },
  {
    id: "jeans",
    name: "Jeans",
    image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=200&q=80",
    slug: "jeans",
  },
  {
    id: "sunglasses",
    name: "Sunglasses",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&q=80",
    slug: "sunglasses",
  },
  {
    id: "wallets",
    name: "Wallets",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
    slug: "wallets",
  },
];

const ShopBySection = () => {
  const navigate = useNavigate();

  const handleItemClick = (item: ShopItem) => {
    navigate(`/products?category=${item.slug}`);
  };

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6">
          Shop by Style
        </h2>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-4">
          {shopItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group flex flex-col items-center gap-2"
            >
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors tarbo-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs lg:text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
                {item.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {shopItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border tarbo-shadow">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-center text-foreground whitespace-nowrap">
                  {item.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopBySection;
