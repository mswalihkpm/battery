import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Privacy Policy</h1>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>We collect personal information you provide when creating an account, placing orders, or contacting us. This includes your name, email, phone number, and delivery address.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to process orders, deliver products, provide customer support, and improve our services. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Security</h2>
            <p>We implement industry-standard security measures including encryption and secure authentication to protect your personal information from unauthorized access.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Cookies</h2>
            <p>We use cookies and local storage to maintain your session, remember your preferences, and improve your browsing experience.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Third-Party Services</h2>
            <p>We use WhatsApp for order communication. When you place an order, your order details are shared via WhatsApp. Please refer to WhatsApp's privacy policy for their data practices.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p>You can access, update, or delete your personal information through your account settings. For any privacy concerns, contact us at tarbo.style.12@gmail.com.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Continued use of our app after changes constitutes acceptance of the updated policy.</p>
          </section>
          <p className="text-xs text-muted-foreground pt-4 border-t border-border">Last updated: February 2026</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
