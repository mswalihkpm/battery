import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    discount_percent: number;
    images: string[];
    brand: string | null;
    rating: number | null;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id,
        product_id,
        product:products (
          id,
          name,
          price,
          discount_percent,
          images,
          brand,
          rating
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching wishlist:", error);
    } else {
      setWishlistItems((data as unknown as WishlistItem[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return false;
    }

    const existingItem = wishlistItems.find(
      (item) => item.product_id === productId
    );

    if (existingItem) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", existingItem.id);

      if (error) {
        toast.error("Failed to remove from wishlist");
        return false;
      }

      toast.success("Removed from wishlist");
      fetchWishlist();
      return true;
    } else {
      const { error } = await supabase.from("wishlists").insert({
        user_id: user.id,
        product_id: productId,
      });

      if (error) {
        toast.error("Failed to add to wishlist");
        return false;
      }

      toast.success("Added to wishlist!");
      fetchWishlist();
      return true;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return {
    wishlistItems,
    loading,
    toggleWishlist,
    isInWishlist,
    wishlistCount,
    refetch: fetchWishlist,
  };
};
