import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import heroMens from "@/assets/hero-mens-fashion.jpg";
import heroKids from "@/assets/hero-kids-fashion.jpg";
import heroAccessories from "@/assets/hero-accessories.jpg";
import heroFootwear from "@/assets/hero-footwear.jpg";

interface Advertisement {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  sort_order: number | null;
}

// Fallback banners when no advertisements exist in database
const fallbackBanners = [
  {
    id: "fallback-1",
    image: heroMens,
    title: "Premium Men's Collection",
    subtitle: "Up to 60% Off",
    cta: "Shop Now",
    link: "/products?category=mens",
  },
  {
    id: "fallback-2",
    image: heroKids,
    title: "Kids Fashion Fest",
    subtitle: "Starting ₹299",
    cta: "Explore",
    link: "/products?category=kids",
  },
  {
    id: "fallback-3",
    image: heroAccessories,
    title: "Luxury Accessories",
    subtitle: "Watches, Wallets & More",
    cta: "View Collection",
    link: "/products?category=accessories",
  },
  {
    id: "fallback-4",
    image: heroFootwear,
    title: "Step into Style",
    subtitle: "Premium Footwear",
    cta: "Shop Footwear",
    link: "/products?category=footwear",
  },
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch advertisements from database
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const { data, error } = await supabase
          .from("advertisements")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setAdvertisements(data || []);
      } catch (error) {
        console.error("Error fetching advertisements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("advertisements-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "advertisements",
        },
        () => {
          fetchAdvertisements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Use database ads if available, otherwise fallback
  const banners = advertisements.length > 0
    ? advertisements.map((ad) => ({
        id: ad.id,
        image: ad.image_url || heroMens,
        title: ad.title,
        subtitle: ad.subtitle || "",
        cta: ad.cta_text || "Shop Now",
        link: ad.cta_link || "/products",
        gradientFrom: ad.gradient_from,
        gradientTo: ad.gradient_to,
      }))
    : fallbackBanners;

  useEffect(() => {
    if (banners.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleShopClick = (link: string, title: string) => {
    navigate(link);
    toast.success(`Exploring ${title}`);
  };

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-background">
        <div className="h-[280px] md:h-[400px] lg:h-[480px] flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded-xl w-full h-full" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Desktop Banner */}
      <div className="hidden md:block relative h-[400px] lg:h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={currentBanner.image}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-lg space-y-4"
                >
                  <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground">
                    {currentBanner.title}
                  </h2>
                  <p className="text-xl lg:text-2xl text-primary font-semibold">
                    {currentBanner.subtitle}
                  </p>
                  <button
                    onClick={() => handleShopClick(currentBanner.link, currentBanner.title)}
                    className="inline-flex items-center px-8 py-3 rounded-xl tarbo-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity tarbo-shadow-glow"
                  >
                    {currentBanner.cta}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile Banner */}
      <div className="md:hidden relative h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img
              src={currentBanner.image}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                {currentBanner.title}
              </h2>
              <p className="text-primary font-semibold mb-2">
                {currentBanner.subtitle}
              </p>
              <button
                onClick={() => handleShopClick(currentBanner.link, currentBanner.title)}
                className="inline-flex items-center px-5 py-2 rounded-lg tarbo-gradient text-primary-foreground text-sm font-semibold"
              >
                {currentBanner.cta}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
