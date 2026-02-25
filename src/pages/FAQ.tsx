import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";

const faqs = [
  { q: "How do I place an order?", a: "Browse products, add items to your cart, and click 'Order'. Select your delivery address and click 'Payment via WhatsApp' to complete your order." },
  { q: "What payment methods do you accept?", a: "We currently accept Cash on Delivery (COD) via WhatsApp order confirmation." },
  { q: "How long does delivery take?", a: "Orders are typically delivered within 3-7 business days across Kerala." },
  { q: "Can I track my order?", a: "Yes, go to Settings → Orders to view your order status and tracking information." },
  { q: "What is the return policy?", a: "We do not offer exchanges or returns at this time. Please check product details carefully before ordering." },
  { q: "How do I contact customer support?", a: "You can reach us via email at tarbo.style.12@gmail.com or call us at 9744942515." },
  { q: "Is my data secure?", a: "Yes, we use industry-standard encryption and secure authentication to protect your personal information." },
  { q: "Do you deliver outside Kerala?", a: "Currently we deliver only within Kerala. We're working on expanding to other states." },
  { q: "How do I change my delivery address?", a: "Go to Settings → Addresses to add, edit or remove your delivery addresses." },
  { q: "What if I receive a damaged product?", a: "Please contact us immediately via WhatsApp or email with photos of the damaged product. We will arrange a replacement." },
];

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }}>
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FAQ;
