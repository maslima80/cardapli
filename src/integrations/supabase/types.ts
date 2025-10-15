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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      catalog_blocks: {
        Row: {
          anchor_slug: string | null
          catalog_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          page_break: boolean | null
          sort: number | null
          type: string | null
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          anchor_slug?: string | null
          catalog_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          page_break?: boolean | null
          sort?: number | null
          type?: string | null
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          anchor_slug?: string | null
          catalog_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          page_break?: boolean | null
          sort?: number | null
          type?: string | null
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_blocks_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          cover: Json | null
          created_at: string | null
          description: string | null
          id: string
          link_ativo: boolean | null
          no_perfil: boolean | null
          settings: Json | null
          slug: string | null
          status: string
          theme_overrides: Json | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cover?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          link_ativo?: boolean | null
          no_perfil?: boolean | null
          settings?: Json | null
          slug?: string | null
          status?: string
          theme_overrides?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cover?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          link_ativo?: boolean | null
          no_perfil?: boolean | null
          settings?: Json | null
          slug?: string | null
          status?: string
          theme_overrides?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_option_values: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          sort: number
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          sort?: number
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          sort?: number
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
          product_id: string
          sort: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          product_id: string
          sort?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          product_id?: string
          sort?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_options: {
        Row: {
          option_id: string
          value_id: string
          variant_id: string
        }
        Insert: {
          option_id: string
          value_id: string
          variant_id: string
        }
        Update: {
          option_id?: string
          value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_options_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_options_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "product_option_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_options_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          combination_key: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_available: boolean
          price: number | null
          product_id: string
          sku: string | null
          user_id: string
        }
        Insert: {
          combination_key?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          price?: number | null
          product_id: string
          sku?: string | null
          user_id: string
        }
        Update: {
          combination_key?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          price?: number | null
          product_id?: string
          sku?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          accepts_customization: boolean | null
          allergens: string | null
          categories: Json | null
          category: string | null
          conservation: string | null
          created_at: string | null
          customization_instructions: string | null
          description: string | null
          disabled_combinations: Json | null
          external_media: Json | null
          id: string
          ingredients: string | null
          min_qty: number | null
          option_groups: Json | null
          photos: Json | null
          price: number | null
          price_hidden: boolean | null
          price_note: string | null
          price_on_request: boolean | null
          price_on_request_label: string | null
          price_unit: string
          price_unit_custom: string | null
          production_days: number | null
          quality_tags: string[] | null
          sku: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
          variants: Json | null
          video_id: string | null
          video_poster_url: string | null
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          accepts_customization?: boolean | null
          allergens?: string | null
          categories?: Json | null
          category?: string | null
          conservation?: string | null
          created_at?: string | null
          customization_instructions?: string | null
          description?: string | null
          disabled_combinations?: Json | null
          external_media?: Json | null
          id?: string
          ingredients?: string | null
          min_qty?: number | null
          option_groups?: Json | null
          photos?: Json | null
          price?: number | null
          price_hidden?: boolean | null
          price_note?: string | null
          price_on_request?: boolean | null
          price_on_request_label?: string | null
          price_unit?: string
          price_unit_custom?: string | null
          production_days?: number | null
          quality_tags?: string[] | null
          sku?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
          variants?: Json | null
          video_id?: string | null
          video_poster_url?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          accepts_customization?: boolean | null
          allergens?: string | null
          categories?: Json | null
          category?: string | null
          conservation?: string | null
          created_at?: string | null
          customization_instructions?: string | null
          description?: string | null
          disabled_combinations?: Json | null
          external_media?: Json | null
          id?: string
          ingredients?: string | null
          min_qty?: number | null
          option_groups?: Json | null
          photos?: Json | null
          price?: number | null
          price_hidden?: boolean | null
          price_note?: string | null
          price_on_request?: boolean | null
          price_on_request_label?: string | null
          price_unit?: string
          price_unit_custom?: string | null
          production_days?: number | null
          quality_tags?: string[] | null
          sku?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          variants?: Json | null
          video_id?: string | null
          video_poster_url?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          accent_color: string | null
          address: string | null
          business_name: string | null
          created_at: string | null
          cta_shape: string | null
          email: string | null
          email_public: string | null
          font_theme: string | null
          id: string
          locations: Json | null
          logo_url: string | null
          phone: number | null
          slogan: string | null
          slug: string | null
          socials: Json | null
          theme_mode: string | null
          updated_at: string | null
          whatsapp: number | null
        }
        Insert: {
          about?: string | null
          accent_color?: string | null
          address?: string | null
          business_name?: string | null
          created_at?: string | null
          cta_shape?: string | null
          email?: string | null
          email_public?: string | null
          font_theme?: string | null
          id?: string
          locations?: Json | null
          logo_url?: string | null
          phone?: number | null
          slogan?: string | null
          slug?: string | null
          socials?: Json | null
          theme_mode?: string | null
          updated_at?: string | null
          whatsapp?: number | null
        }
        Update: {
          about?: string | null
          accent_color?: string | null
          address?: string | null
          business_name?: string | null
          created_at?: string | null
          cta_shape?: string | null
          email?: string | null
          email_public?: string | null
          font_theme?: string | null
          id?: string
          locations?: Json | null
          logo_url?: string | null
          phone?: number | null
          slogan?: string | null
          slug?: string | null
          socials?: Json | null
          theme_mode?: string | null
          updated_at?: string | null
          whatsapp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      build_variant_combination_key: {
        Args: { p_variant_id: string }
        Returns: string
      }
      is_slug_available: {
        Args: { check_slug: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
