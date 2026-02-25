import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Shield, CreditCard, X } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On all orders",
    hasModal: true,
    modalContent: {
      title: "Free Home Delivery",
      subtitle: "Across All of Kerala! 🌴",
      details: [
        "Free delivery on all orders",
        "Delivery available to all districts in Kerala",
        "Expected delivery: 1-7 business days",
        "Track your order in real-time",
        "Safe and secure packaging"
      ]
    }
  },
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Genuine products only",
    hasModal: false,
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "100% secure checkout",
    hasModal: false,
  },
];

const OfferBanner = () => {
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const handleFeatureClick = (index: number) => {
    if (features[index].hasModal) {
      setActiveModal(index);
    }
  };

  return (
    <>
      <section className="py-8 md:py-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          {/* Desktop */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.title}
                  onClick={() => handleFeatureClick(index)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 text-left ${
                    feature.hasModal ? "cursor-pointer hover:border-primary/50 hover:bg-card/80" : "cursor-default"
                  } transition-all`}
                >
                  <div className="p-3 rounded-lg tarbo-gradient">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Mobile Scroll */}
          <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 min-w-max">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.title}
                    onClick={() => handleFeatureClick(index)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 min-w-[180px] text-left ${
                      feature.hasModal ? "cursor-pointer hover:border-primary/50" : "cursor-default"
                    } transition-all`}
                  >
                    <div className="p-2 rounded-lg tarbo-gradient">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {activeModal !== null && features[activeModal].modalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg tarbo-gradient">
                  {(() => {
                    const Icon = features[activeModal].icon;
                    return <Icon className="h-6 w-6 text-primary-foreground" />;
                  })()}
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="text-xl font-display font-bold text-foreground mb-1">
                {features[activeModal].modalContent.title}
              </h2>
              <p className="text-primary font-medium mb-4">
                {features[activeModal].modalContent.subtitle}
              </p>

              <ul className="space-y-3">
                {features[activeModal].modalContent.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full mt-6 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfferBanner;
