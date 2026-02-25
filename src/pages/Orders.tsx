import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

interface Order {
  id: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  placed: { icon: Clock, color: "text-yellow-500", label: "Order Placed" },
  confirmed: { icon: CheckCircle, color: "text-blue-500", label: "Confirmed" },
  shipped: { icon: Truck, color: "text-purple-500", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-primary", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled" },
};

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_status,
        payment_status,
        payment_method,
        total,
        created_at,
        order_items (
          id,
          product_name,
          product_image,
          price,
          quantity,
          size,
          color
        )
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-secondary rounded-xl" />
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
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 tarbo-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.order_status] || statusConfig.placed;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1.5 ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.order_items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                            <img
                              src={item.product_image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80"}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                      {order.order_items.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            +{order.order_items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items.reduce((acc, i) => acc + i.quantity, 0)} items
                        </p>
                        <p className="font-semibold">₹{Math.round(Number(order.total))}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-secondary capitalize">
                        {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Orders;
