import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import tarboLogo from "@/assets/tarbo-logo.png";

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center gap-3"
          >
            <img src={tarboLogo} alt="TARBO STYLE" className="h-24 w-auto" />
            <div className="flex flex-col items-center">
              <span className="font-display text-4xl font-bold text-foreground tracking-widest">TARBO</span>
              <span className="text-sm font-semibold text-primary tracking-[0.3em] -mt-1">STYLE</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
