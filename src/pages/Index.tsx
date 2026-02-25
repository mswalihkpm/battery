import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import HeroBanner from "@/components/HeroBanner";
import CategoryShowcase from "@/components/CategoryShowcase";
import ShopBySection from "@/components/ShopBySection";
import DealsSection from "@/components/DealsSection";
import OfferBanner from "@/components/OfferBanner";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [splashDone, setSplashDone] = useState(false);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAddress = async () => {
      if (!user) {
        setShowAddressPrompt(false);
        return;
      }

      const skipKey = `address_prompt_skipped_${user.id}`;
      const skipped = localStorage.getItem(skipKey) === "true";

      const { count, error } = await supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to check addresses", error);
        return;
      }

      const hasAddress = (count ?? 0) > 0;
      if (hasAddress) {
        localStorage.removeItem(skipKey);
      }

      setShowAddressPrompt(!hasAddress && !skipped);
    };

    if (!loading) {
      void checkAddress();
    }
  }, [user, loading]);

  const handleSkipAddress = () => {
    if (!user) return;
    localStorage.setItem(`address_prompt_skipped_${user.id}`, "true");
    setShowAddressPrompt(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {showAddressPrompt && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 tarbo-shadow">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <MapPin className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-display font-bold text-center mb-2">Add your address</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Add your delivery address first to place orders quickly.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/settings/addresses")}
                className="w-full py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold"
              >
                Add Address
              </button>
              <button
                onClick={handleSkipAddress}
                className="w-full py-3 rounded-xl border border-border font-medium hover:bg-secondary transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
      <Header />
      <CategoryNav />
      <main>
        <HeroBanner />
        <OfferBanner />
        <CategoryShowcase />
        <ShopBySection />
        <DealsSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
