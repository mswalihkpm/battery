import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Terms & Conditions</h1>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. General</h2>
            <p>By using TARBO STYLE, you agree to these terms and conditions. If you do not agree, please do not use our app or services.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Orders & Payments</h2>
            <p>All orders are placed via WhatsApp confirmation. Payment is Cash on Delivery (COD). We reserve the right to cancel orders that cannot be fulfilled due to stock availability.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Pricing</h2>
            <p>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes. Prices may change without prior notice.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Delivery</h2>
            <p>We deliver within Kerala. Delivery times are estimated at 1-7 business days. Free delivery is available on all orders.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. No Exchange or Return</h2>
            <p>We do not offer exchanges or returns. Please review product details, size, and color carefully before placing your order. For damaged or defective products, contact us within 24 hours of delivery.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Intellectual Property</h2>
            <p>All content, logos, and branding on TARBO STYLE are our property and may not be used without permission.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contact</h2>
            <p>For questions about these terms, contact us at tarbo.style.12@gmail.com or call 9744942515.</p>
          </section>
          <p className="text-xs text-muted-foreground pt-4 border-t border-border">Last updated: February 2026</p>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;
