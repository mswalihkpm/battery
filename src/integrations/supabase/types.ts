export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          district: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          gradient_from: string | null
          gradient_to: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_themes: {
        Row: {
          accent_color: string | null
          banner_emoji: string | null
          banner_text: string | null
          bg_color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          primary_color: string | null
          primary_dark: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          banner_emoji?: string | null
          banner_text?: string | null
          bg_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          primary_color?: string | null
          primary_dark?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          banner_emoji?: string | null
          banner_text?: string | null
          bg_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          primary_color?: string | null
          primary_dark?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_value: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          coupon_code: string | null
          created_at: string
          delivery_fee: number | null
          discount: number | null
          id: string
          order_status: string | null
          payment_method: string
          payment_status: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id?: string | null
          coupon_code?: string | null
          created_at?: string
          delivery_fee?: number | null
          discount?: number | null
          id?: string
          order_status?: string | null
          payment_method: string
          payment_status?: string | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string | null
          coupon_code?: string | null
          created_at?: string
          delivery_fee?: number | null
          discount?: number | null
          id?: string
          order_status?: string | null
          payment_method?: string
          payment_status?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          discount_percent: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          product_number: number
          rating: number | null
          review_count: number | null
          sizes: string[] | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          product_number?: number
          rating?: number | null
          review_count?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          product_number?: number
          rating?: number | null
          review_count?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          media_urls: string[] | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          media_urls?: string[] | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          media_urls?: string[] | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
