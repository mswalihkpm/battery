import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    discount_percent: number;
    images: string[];
    brand: string | null;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        quantity,
        size,
        color,
        product:products (
          id,
          name,
          price,
          discount_percent,
          images,
          brand
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching cart:", error);
    } else {
      setCartItems((data as unknown as CartItem[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (
    productId: string,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }

    // Check if item already exists in cart
    const existingItem = cartItems.find(
      (item) =>
        item.product_id === productId &&
        item.size === (size || null) &&
        item.color === (color || null)
    );

    if (existingItem) {
      return updateQuantity(existingItem.id, existingItem.quantity + quantity);
    }

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity,
      size: size || null,
      color: color || null,
    });

    if (error) {
      toast.error("Failed to add to cart");
      return false;
    }

    toast.success("Added to cart!");
    fetchCart();
    return true;
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (error) {
      toast.error("Failed to update quantity");
      return false;
    }

    fetchCart();
    return true;
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      toast.error("Failed to remove item");
      return false;
    }

    toast.success("Removed from cart");
    fetchCart();
    return true;
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing cart:", error);
      return;
    }

    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.product.price;
    const discount = item.product.discount_percent || 0;
    const finalPrice = price - (price * discount) / 100;
    return acc + finalPrice * item.quantity;
  }, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    refetch: fetchCart,
  };
};
