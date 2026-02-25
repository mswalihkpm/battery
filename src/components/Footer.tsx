import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { toast } from "sonner";
import tarboLogo from "@/assets/tarbo-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={tarboLogo} alt="TARBO STYLE" className="h-12 w-auto" />
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">TARBO</h3>
                <span className="text-xs font-medium text-primary">STYLE</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium fashion destination for Men, Kids, Accessories, and Footwear. 
              Shop the latest styles with confidence.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:9744942515" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => toast.success("Calling TARBO STYLE...")}
                >
                  <Phone className="h-4 w-4" />
                  9744942515
                </a>
              </li>
              <li>
                <a 
                  href="mailto:tarbo.style.12@gmail.com" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => toast.success("Opening email...")}
                >
                  <Mail className="h-4 w-4" />
                  tarbo.style.12@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/_tarbo_style" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => toast.success("Opening Instagram...")}
                >
                  <Instagram className="h-4 w-4" />
                  @_tarbo_style
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Othukkungal, Malappuram, Kerala, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 TARBO STYLE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
