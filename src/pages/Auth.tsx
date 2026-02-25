import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import tarboLogo from "@/assets/tarbo-logo.png";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  // Phone OTP states
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAdminCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === "741159") {
      sessionStorage.setItem("admin_access", "true");
      navigate("/admin");
    } else {
      toast.error("Invalid code");
      setAdminCode("");
    }
  };

const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      toast.error("Google sign in failed");
    }
  } catch (error: any) {
    toast.error("Google sign in failed");
  } finally {
    setLoading(false);
  }
};

 const handleAppleSignIn = async () => {
  setLoading(true);
  try {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo },
    });
    if (error) {
      toast.error("Apple sign in failed");
    }
  } catch (error: any) {
    toast.error("Apple sign in failed");
  } finally {
    setLoading(false);
  }
};

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!cleaned || cleaned.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const fullPhone = cleaned.startsWith("+") ? cleaned : `+91${cleaned}`;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) {
        toast.error("Failed to send OTP: " + error.message);
      } else {
        setOtpSent(true);
        toast.success("OTP sent to " + fullPhone);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    const cleaned = phoneNumber.replace(/\s/g, "");
    const fullPhone = cleaned.startsWith("+") ? cleaned : `+91${cleaned}`;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: "sms",
      });
      if (error) {
        toast.error("Invalid OTP: " + error.message);
      } else if (data.user) {
        // Update profile phone
        await supabase.from("profiles").update({ phone: fullPhone }).eq("user_id", data.user.id);
        toast.success("Welcome!");
        navigate("/");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 tarbo-shadow">
          <div className="flex flex-col items-center mb-8">
            <img
              src={tarboLogo}
              alt="TARBO STYLE"
              className="h-16 w-auto mb-4 cursor-default"
              onClick={() => {
                const newCount = logoTapCount + 1;
                setLogoTapCount(newCount);
                if (newCount >= 5) {
                  setShowAdminCode(true);
                  setLogoTapCount(0);
                }
              }}
            />
            <h1 className="text-2xl font-display font-bold text-foreground">Welcome</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue shopping</p>
          </div>

          {showAdminCode ? (
            <form onSubmit={handleAdminCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Admin Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin code"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border-none outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-12 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Enter
              </button>
              <button
                type="button"
                onClick={() => setShowAdminCode(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </form>
          ) : showPhoneLogin ? (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Enter phone number"
                        maxLength={10}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary border-none outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || phoneNumber.length < 10}
                    className="w-full h-12 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending OTP...</> : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Verification Code</label>
                    <p className="text-xs text-muted-foreground mb-3">Enter the 6-digit code sent to +91{phoneNumber}</p>
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2, 3, 4, 5].map(idx => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={otp[idx] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            const newOtp = otp.split("");
                            newOtp[idx] = val;
                            setOtp(newOtp.join("").slice(0, 6));
                            if (val && idx < 5) {
                              const next = e.target.nextElementSibling as HTMLInputElement;
                              next?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                              const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                              prev?.focus();
                            }
                          }}
                          className="w-11 h-12 text-center text-lg font-semibold bg-secondary rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</> : "Verify & Sign In"}
                  </button>
                  <button
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change phone number
                  </button>
                </>
              )}
              <button
                onClick={() => { setShowPhoneLogin(false); setOtpSent(false); setOtp(""); setPhoneNumber(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to social login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-card border border-border rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Apple Sign In */}
              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-foreground text-background rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Phone Login */}
              <button
                onClick={() => setShowPhoneLogin(true)}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-card border border-border rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <Phone className="h-5 w-5" />
                Continue with Phone
              </button>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
