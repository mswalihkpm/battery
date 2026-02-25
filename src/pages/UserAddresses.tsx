import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Plus, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

interface Address {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  is_default: boolean;
}

const emptyForm = { name: "", phone: "", address_line1: "", address_line2: "", city: "", district: "", state: "Kerala", pincode: "" };

const UserAddresses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user!.id)
      .order("is_default", { ascending: false });
    if (data) setAddresses(data as Address[]);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address_line1 || !form.city || !form.district || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("addresses").insert({
      user_id: user!.id,
      name: form.name,
      phone: form.phone,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || null,
      city: form.city,
      district: form.district,
      state: "Kerala",
      pincode: form.pincode,
      is_default: addresses.length === 0,
    } as any);
    if (error) {
      toast.error("Failed to save address");
    } else {
      toast.success("Address added!");
      setForm(emptyForm);
      setShowForm(false);
      fetchAddresses();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast.success("Address removed");
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    fetchAddresses();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/settings")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-display font-bold text-foreground">My Addresses</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-3 py-2 tarbo-gradient text-primary-foreground rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-4 mb-4 space-y-3"
          >
            <h3 className="font-semibold">New Address</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name"
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number"
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Address Line 1 *</label>
              <input type="text" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} placeholder="House/Flat, Building, Street"
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Address Line 2</label>
              <input type="text" value={form.address_line2} onChange={e => setForm(f => ({ ...f, address_line2: e.target.value }))} placeholder="Area, Landmark (optional)"
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">City *</label>
              <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City"
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">District *</label>
              <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="">Select District</option>
                {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">State</label>
              <input type="text" value="Kerala" disabled
                className="w-full px-3 py-2 bg-secondary/50 rounded-lg text-sm text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pincode *</label>
              <input type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="6-digit pincode"
                className="w-full px-3 py-2 bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 tarbo-gradient text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-70">
                {saving ? "Saving..." : "Save Address"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-secondary rounded-lg text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-28 bg-secondary rounded-xl" />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No addresses saved yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, i) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-xl border p-4 ${addr.is_default ? "border-primary" : "border-border"}`}
              >
                {addr.is_default && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mb-2">
                    <Check className="h-3 w-3" /> Default
                  </span>
                )}
                <p className="font-semibold">{addr.name}</p>
                <p className="text-sm text-muted-foreground">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                <p className="text-sm text-muted-foreground">{addr.city}{addr.district ? `, ${addr.district}` : ""}, {addr.state} - {addr.pincode}</p>
                <p className="text-sm text-muted-foreground">📞 {addr.phone}</p>
                <div className="flex gap-2 mt-3">
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-primary hover:underline">Set as Default</button>
                  )}
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-destructive hover:underline ml-auto flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserAddresses;
