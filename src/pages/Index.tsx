import { useState } from "react";
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

const Index = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
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
