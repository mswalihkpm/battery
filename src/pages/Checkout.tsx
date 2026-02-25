import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, CreditCard, Smartphone, Check, ArrowLeft, Package, Truck, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

type CheckoutStep = "cart" | "address" | "payment" | "confirm" | "success";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const { couponCode, discount = 0, deliveryFee = 0, total } = (location.state as any) || {};

  const steps = [
    { key: "address", label: "Address", icon: MapPin },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "confirm", label: "Confirm", icon: Package },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchAddresses();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (cartItems.length === 0 && !loading && !authLoading && currentStep !== "success") {
      navigate("/cart");
    }
  }, [cartItems, loading, authLoading, navigate, currentStep]);

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user!.id)
      .order("is_default", { ascending: false });

    if (!error && data) {
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(data[0].id);
      }
    }
    setLoading(false);
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user!.id,
        ...newAddress,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add address");
      return;
    }

    setAddresses([...addresses, data]);
    setSelectedAddress(data.id);
    setShowAddAddress(false);
    setNewAddress({
      name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
    });
    toast.success("Address added successfully");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          address_id: selectedAddress,
          subtotal: cartTotal,
          discount: discount,
          delivery_fee: deliveryFee,
          total: total || cartTotal - discount + deliveryFee,
          coupon_code: couponCode || null,
          payment_method: paymentMethod,
          payment_status: "completed",
          order_status: "placed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
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

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      // Show success step
      setCurrentStep("success");
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === "address") {
      if (!selectedAddress && addresses.length === 0) {
        toast.error("Please add a delivery address");
        return;
      }
      if (!selectedAddress) {
        toast.error("Please select a delivery address");
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      handlePlaceOrder();
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("address");
    } else if (currentStep === "confirm") {
      setCurrentStep("payment");
    }
  };

  const getSelectedAddress = () => {
    return addresses.find(a => a.id === selectedAddress);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/4 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-secondary rounded-xl" />
              <div className="h-40 bg-secondary rounded-xl" />
            </div>
            <div className="h-64 bg-secondary rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your order has been confirmed and will be delivered soon. You can track your order in the Orders section.
            </p>

            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Truck className="h-5 w-5 text-primary" />
                <span className="font-medium">Estimated Delivery</span>
              </div>
              <p className="text-2xl font-bold text-primary">1-7 Business Days</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate("/products")}
                className="flex-1 py-3 border border-border rounded-xl font-semibold hover:bg-secondary transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-8">
        <button
          onClick={() => navigate("/cart")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
          Checkout
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isPast = steps.findIndex(s => s.key === currentStep) > index;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : isPast 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary text-muted-foreground"
                }`}>
                  {isPast ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${isPast ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Address Step */}
              {currentStep === "address" && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delivery Address
                    </h2>
                    <button
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      Add New
                    </button>
                  </div>

                  {/* Add Address Form */}
                  {showAddAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-6 p-4 bg-secondary/50 rounded-lg space-y-3"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Address Line 1 *"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        className="w-full px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={newAddress.address_line2}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                        className="w-full px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="City *"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Pincode *"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="px-3 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddAddress}
                          className="px-4 py-2 tarbo-gradient text-primary-foreground rounded-lg font-medium"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowAddAddress(false)}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Address List */}
                  {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No addresses found. Please add a delivery address.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedAddress === address.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="address"
                              value={address.id}
                              checked={selectedAddress === address.id}
                              onChange={() => setSelectedAddress(address.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.name}</span>
                                {address.is_default && (
                                  <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Phone: {address.phone}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "upi"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium">UPI Payment</span>
                        <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Credit / Debit Card</span>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Confirm Step */}
              {currentStep === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Order Items */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Package className="h-5 w-5 text-primary" />
                      Order Items ({cartItems.length})
                    </h2>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <img
                            src={item.product.images?.[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            ₹{Math.round((item.product.price - (item.product.price * (item.product.discount_percent || 0)) / 100) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delivery Address
                    </h2>
                    {getSelectedAddress() && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{getSelectedAddress()?.name}</p>
                        <p>{getSelectedAddress()?.address_line1}</p>
                        {getSelectedAddress()?.address_line2 && <p>{getSelectedAddress()?.address_line2}</p>}
                        <p>{getSelectedAddress()?.city}, {getSelectedAddress()?.state} - {getSelectedAddress()?.pincode}</p>
                        <p>Phone: {getSelectedAddress()?.phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Method
                    </h2>
                    <p className="text-sm text-muted-foreground capitalize">
                      {paymentMethod === "upi" ? "UPI Payment" : "Credit / Debit Card"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep !== "address" && (
                <button
                  onClick={handlePrevStep}
                  className="flex-1 py-3 border border-border rounded-xl font-semibold hover:bg-secondary transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={processing}
                className="flex-1 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === "confirm" ? (
                  "Place Order"
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                  </span>
                  <span className="font-medium">₹{Math.round(cartTotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-₹{Math.round(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-primary font-medium" : ""}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{Math.round(total || cartTotal - discount + deliveryFee)}</span>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg text-center text-sm text-muted-foreground">
                <Truck className="h-4 w-4 inline-block mr-1" />
                Free delivery on all orders!
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
