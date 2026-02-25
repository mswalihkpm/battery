import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user!.id)
      .single();
    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user!.id, full_name: fullName, phone, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved successfully!");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/settings")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl" />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>

            {/* Full Name */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-xs text-muted-foreground mb-2 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Phone */}
            <div className="bg-card rounded-xl border border-border p-4">
              <label className="text-xs text-muted-foreground mb-2 block">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Profile;
