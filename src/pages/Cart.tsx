import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck,
  X, CheckCircle2, MessageCircle, MapPin, Loader2, Package
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

interface Address {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const WHATSAPP_PHONE = "919744942515";

const Cart = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, loading, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", pincode: "",
  });

  const deliveryFee = 0;
  const finalTotal = cartTotal;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchAddresses = async () => {
    if (!user) return;
    setAddressLoading(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    if (!error && data) {
      setAddresses(data);
      if (data.length > 0) setSelectedAddressId(data[0].id);
    }
    setAddressLoading(false);
  };

  const handleOpenOrderModal = async () => {
    await fetchAddresses();
    setShowOrderModal(true);
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    const { data, error } = await supabase
      .from("addresses")
      .insert({ user_id: user!.id, ...newAddress, is_default: addresses.length === 0 })
      .select()
      .single();

    if (error) { toast.error("Failed to save address"); return; }

    setAddresses(prev => [...prev, data]);
    setSelectedAddressId(data.id);
    setShowAddressForm(false);
    setNewAddress({ name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: "" });
    toast.success("Address saved!");
  };

  const handlePlaceAndPay = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacing(true);
    try {
      // Save order to DB
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          address_id: selectedAddressId,
          subtotal: cartTotal,
          discount: 0,
          delivery_fee: deliveryFee,
          total: finalTotal,
          payment_method: "whatsapp",
          payment_status: "pending",
          order_status: "placed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Save order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.images?.[0] || null,
        price: item.product.price - (item.product.price * (item.product.discount_percent || 0)) / 100,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderId(order.id);

      // Build WhatsApp message with order details
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);

      // Fetch product numbers for each item
      const productIds = cartItems.map(i => i.product_id);
      const { data: productData } = await supabase
        .from("products")
        .select("id, product_number")
        .in("id", productIds);
      const pnMap: Record<string, number | null> = {};
      productData?.forEach(p => { pnMap[p.id] = (p as any).product_number; });

      const itemLines = cartItems
        .map((item) => {
          const discountedPrice = Math.round(
            item.product.price - (item.product.price * (item.product.discount_percent || 0)) / 100
          );
          const pn = pnMap[item.product_id];
          let line = `• ${pn ? `#${pn} ` : ""}${item.product.name} x${item.quantity} = ₹${discountedPrice * item.quantity}`;
          if (item.size) line += ` (Size: ${item.size})`;
          if (item.color) line += ` (Color: ${item.color})`;
          return line;
        })
        .join("\n");

      const addressText = selectedAddress
        ? `${selectedAddress.name}, ${selectedAddress.address_line1}${selectedAddress.address_line2 ? ", " + selectedAddress.address_line2 : ""}, ${selectedAddress.city}, ${(selectedAddress as any).district ? (selectedAddress as any).district + ", " : ""}${selectedAddress.state} - ${selectedAddress.pincode}\nPhone: ${selectedAddress.phone}`
        : "Address not selected";

      const message =
        `Hi\nI am your new customer.\n\n` +
        `*ORDER REQUEST*\n` +
        `Order ID: ${order.id.slice(0, 8).toUpperCase()}\n\n` +
        `*Items:*\n${itemLines}\n\n` +
        `Subtotal: ₹${Math.round(cartTotal)}\n` +
        `Delivery: ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}\n` +
        `*Total: ₹${Math.round(finalTotal)}*\n\n` +
        `*Delivery Address:*\n${addressText}`;

      // Clear cart
      await clearCart();

      // Open WhatsApp
      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      setShowOrderModal(false);
      toast.success("Order placed! Opening WhatsApp...");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => {
                const price = item.product.price;
                const discount = item.product.discount_percent || 0;
                const finalPrice = price - (price * discount) / 100;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 flex gap-4"
                  >
                    <Link
                      to={`/product/${item.product_id}`}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {item.product.brand || "TARBO"}
                      </p>
                      <Link
                        to={`/product/${item.product_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>

                      {(item.size || item.color) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " • "}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-foreground">
                          ₹{Math.round(finalPrice)}
                        </span>
                        {discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{price}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{Math.round(cartTotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryFee === 0 ? "text-primary font-medium" : ""}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <p className="text-xs text-primary flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Free delivery on all orders!
                  </p>

                  <div className="pt-3 border-t border-border flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>₹{Math.round(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleOpenOrderModal}
                  className="w-full mt-6 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />

      {/* Order + Payment Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowOrderModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Confirm Your Order</h2>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Items Summary */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                    <Package className="h-4 w-4" />
                    Items Ordered
                  </h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const discountedPrice = Math.round(
                        item.product.price - (item.product.price * (item.product.discount_percent || 0)) / 100
                      );
                      return (
                        <div key={item.id} className="flex gap-3 p-3 bg-secondary/40 rounded-lg">
                          <img
                            src={item.product.images?.[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" • ")}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-sm flex-shrink-0">
                            ₹{discountedPrice * item.quantity}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-3 p-3 bg-primary/5 rounded-lg space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{Math.round(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className={deliveryFee === 0 ? "text-primary font-medium" : ""}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                      <span>Total</span>
                      <span>₹{Math.round(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      {showAddressForm ? "Cancel" : "+ Add New"}
                    </button>
                  </div>

                  {/* Add Address Form */}
                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Full Name *" value={newAddress.name}
                              onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                              className="px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                            <input type="tel" placeholder="Phone *" value={newAddress.phone}
                              onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                              className="px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <input type="text" placeholder="Address Line 1 *" value={newAddress.address_line1}
                            onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                          <input type="text" placeholder="Address Line 2 (Optional)" value={newAddress.address_line2}
                            onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="City *" value={newAddress.city}
                              onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                            <input type="text" placeholder="State *" value={newAddress.state}
                              onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                            <input type="text" placeholder="Pincode *" value={newAddress.pincode}
                              onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                              className="px-3 py-2 text-sm bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <button onClick={handleAddAddress}
                            className="w-full py-2 tarbo-gradient text-primary-foreground rounded-lg text-sm font-medium">
                            Save Address
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Address List */}
                  {addressLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No saved addresses. Please add one above.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <input type="radio" name="addr" value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-0.5 accent-primary" />
                          <div className="text-sm leading-relaxed">
                            <p className="font-medium">{address.name} {address.is_default && <span className="text-xs text-primary">(Default)</span>}</p>
                            <p className="text-muted-foreground">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}</p>
                            <p className="text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-muted-foreground">📞 {address.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp Payment Button */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 text-center">
                    Your order will be saved and you'll be connected via WhatsApp to complete the payment.
                  </p>
                  <button
                    onClick={handlePlaceAndPay}
                    disabled={placing || !selectedAddressId}
                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-[hsl(142,72%,29%)] text-white hover:bg-[hsl(142,72%,24%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5" />
                        Payment via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
