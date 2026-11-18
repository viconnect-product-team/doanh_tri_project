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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assistant_public_state: {
        Row: {
          blocked_reason: string | null
          id: boolean
        }
        Insert: {
          blocked_reason?: string | null
          id?: boolean
        }
        Update: {
          blocked_reason?: string | null
          id?: boolean
        }
        Relationships: []
      }
      assistant_threads: {
        Row: {
          blocked_reason: string | null
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_reason?: string | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_reason?: string | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string
          description_en: string | null
          duration: string
          duration_en: string | null
          id: string
          published: boolean
          sort_order: number
          start_date: string
          tag: string
          tag_en: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          description_en?: string | null
          duration?: string
          duration_en?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          start_date?: string
          tag?: string
          tag_en?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          description_en?: string | null
          duration?: string
          duration_en?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          start_date?: string
          tag?: string
          tag_en?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          organization: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attendees: string
          attendees_en: string | null
          capacity: number | null
          created_at: string
          description: string
          description_en: string | null
          event_date: string
          featured: boolean
          id: string
          image_caption: string
          image_caption_en: string | null
          image_thumb_url: string
          image_url: string
          is_recurring: boolean
          mode: string
          mode_en: string | null
          place: string
          place_en: string | null
          published: boolean
          source_name: string
          source_url: string
          tag: string
          tag_en: string | null
          time_range: string
          title: string
          title_en: string | null
          topic: string
          topic_en: string | null
          updated_at: string
        }
        Insert: {
          attendees?: string
          attendees_en?: string | null
          capacity?: number | null
          created_at?: string
          description?: string
          description_en?: string | null
          event_date?: string
          featured?: boolean
          id?: string
          image_caption?: string
          image_caption_en?: string | null
          image_thumb_url?: string
          image_url?: string
          is_recurring?: boolean
          mode?: string
          mode_en?: string | null
          place?: string
          place_en?: string | null
          published?: boolean
          source_name?: string
          source_url?: string
          tag?: string
          tag_en?: string | null
          time_range?: string
          title: string
          title_en?: string | null
          topic?: string
          topic_en?: string | null
          updated_at?: string
        }
        Update: {
          attendees?: string
          attendees_en?: string | null
          capacity?: number | null
          created_at?: string
          description?: string
          description_en?: string | null
          event_date?: string
          featured?: boolean
          id?: string
          image_caption?: string
          image_caption_en?: string | null
          image_thumb_url?: string
          image_url?: string
          is_recurring?: boolean
          mode?: string
          mode_en?: string | null
          place?: string
          place_en?: string | null
          published?: boolean
          source_name?: string
          source_url?: string
          tag?: string
          tag_en?: string | null
          time_range?: string
          title?: string
          title_en?: string | null
          topic?: string
          topic_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      experts: {
        Row: {
          bio: string
          bio_en: string | null
          category: string
          category_en: string | null
          created_at: string
          id: string
          image_thumb_url: string
          image_url: string
          name: string
          name_en: string | null
          org: string
          org_en: string | null
          published: boolean
          role: string
          role_en: string | null
          sort_order: number
          source_name: string
          source_url: string
          updated_at: string
        }
        Insert: {
          bio?: string
          bio_en?: string | null
          category?: string
          category_en?: string | null
          created_at?: string
          id?: string
          image_thumb_url?: string
          image_url?: string
          name: string
          name_en?: string | null
          org?: string
          org_en?: string | null
          published?: boolean
          role?: string
          role_en?: string | null
          sort_order?: number
          source_name?: string
          source_url?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          bio_en?: string | null
          category?: string
          category_en?: string | null
          created_at?: string
          id?: string
          image_thumb_url?: string
          image_url?: string
          name?: string
          name_en?: string | null
          org?: string
          org_en?: string | null
          published?: boolean
          role?: string
          role_en?: string | null
          sort_order?: number
          source_name?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ai_suggestions: Json | null
          created_at: string
          customer_id: string | null
          email: string
          event_id: string | null
          full_name: string
          id: string
          interest: string | null
          membership_tier: string | null
          message: string | null
          notes: string | null
          organization: string | null
          participant_count: number | null
          phone: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          customer_id?: string | null
          email: string
          event_id?: string | null
          full_name: string
          id?: string
          interest?: string | null
          membership_tier?: string | null
          message?: string | null
          notes?: string | null
          organization?: string | null
          participant_count?: number | null
          phone?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          customer_id?: string | null
          email?: string
          event_id?: string | null
          full_name?: string
          id?: string
          interest?: string | null
          membership_tier?: string | null
          message?: string | null
          notes?: string | null
          organization?: string | null
          participant_count?: number | null
          phone?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_membership_tier_fkey"
            columns: ["membership_tier"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payment_orders: {
        Row: {
          account_holder: string
          account_number: string
          amount: number
          bank_name: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          ends_on: string | null
          full_name: string
          id: string
          member_id: string
          organization: string
          package_title: string
          phone: string
          reference: string
          starts_on: string | null
          status: string
          tier_id: string
        }
        Insert: {
          account_holder: string
          account_number: string
          amount: number
          bank_name: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          ends_on?: string | null
          full_name: string
          id?: string
          member_id: string
          organization?: string
          package_title: string
          phone?: string
          reference: string
          starts_on?: string | null
          status?: string
          tier_id: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          amount?: number
          bank_name?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          ends_on?: string | null
          full_name?: string
          id?: string
          member_id?: string
          organization?: string
          package_title?: string
          phone?: string
          reference?: string
          starts_on?: string | null
          status?: string
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_payment_orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_payment_orders_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payment_settings: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          enabled: boolean
          fees_confirmed: boolean
          id: boolean
          updated_at: string
        }
        Insert: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          enabled?: boolean
          fees_confirmed?: boolean
          id?: boolean
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          enabled?: boolean
          fees_confirmed?: boolean
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          active: boolean
          approval_status: string
          approved_at: string | null
          created_at: string
          ends_on: string | null
          full_name: string
          id: string
          invitation_sent_at: string | null
          organization: string
          phone: string
          registration_request_id: string | null
          starts_on: string | null
          tier_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          approval_status?: string
          approved_at?: string | null
          created_at?: string
          ends_on?: string | null
          full_name: string
          id?: string
          invitation_sent_at?: string | null
          organization?: string
          phone?: string
          registration_request_id?: string | null
          starts_on?: string | null
          tier_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          approval_status?: string
          approved_at?: string | null
          created_at?: string
          ends_on?: string | null
          full_name?: string
          id?: string
          invitation_sent_at?: string | null
          organization?: string
          phone?: string
          registration_request_id?: string | null
          starts_on?: string | null
          tier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_registration_request_id_fkey"
            columns: ["registration_request_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_profiles_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      member_records: {
        Row: {
          benefit_key: string | null
          created_at: string
          event_date: string | null
          id: string
          kind: string
          member_id: string
          quantity: number
          status: string
          title: string
        }
        Insert: {
          benefit_key?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          kind: string
          member_id: string
          quantity?: number
          status?: string
          title: string
        }
        Update: {
          benefit_key?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          kind?: string
          member_id?: string
          quantity?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          ceo: number
          created_at: string
          description: string
          description_en: string | null
          dinners: number
          fee: number
          flowers: number
          id: string
          knowledge: number
          mentoring: number
          overseas: number
          press: number
          published: boolean
          sort_order: number
          speaking: number
          title: string
          title_en: string | null
          updated_at: string
          visits: number
        }
        Insert: {
          ceo?: number
          created_at?: string
          description?: string
          description_en?: string | null
          dinners?: number
          fee?: number
          flowers?: number
          id?: string
          knowledge?: number
          mentoring?: number
          overseas?: number
          press?: number
          published?: boolean
          sort_order?: number
          speaking?: number
          title: string
          title_en?: string | null
          updated_at?: string
          visits?: number
        }
        Update: {
          ceo?: number
          created_at?: string
          description?: string
          description_en?: string | null
          dinners?: number
          fee?: number
          flowers?: number
          id?: string
          knowledge?: number
          mentoring?: number
          overseas?: number
          press?: number
          published?: boolean
          sort_order?: number
          speaking?: number
          title?: string
          title_en?: string | null
          updated_at?: string
          visits?: number
        }
        Relationships: []
      }
      partners: {
        Row: {
          category: string
          created_at: string
          description: string
          description_en: string | null
          id: string
          image_thumb_url: string
          image_url: string
          name: string
          name_en: string | null
          published: boolean
          sort_order: number
          updated_at: string
          website_url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          description_en?: string | null
          id?: string
          image_thumb_url?: string
          image_url?: string
          name: string
          name_en?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          description_en?: string | null
          id?: string
          image_thumb_url?: string
          image_url?: string
          name?: string
          name_en?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      partnership_orders: {
        Row: {
          account_holder: string
          account_number: string
          amount: number
          bank_name: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          organization: string
          package_id: string
          package_title: string
          phone: string
          reference: string
          status: string
        }
        Insert: {
          account_holder: string
          account_number: string
          amount: number
          bank_name: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string
          organization: string
          package_id: string
          package_title: string
          phone?: string
          reference: string
          status?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          amount?: number
          bank_name?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          organization?: string
          package_id?: string
          package_title?: string
          phone?: string
          reference?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "partnership_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_packages: {
        Row: {
          created_at: string
          description: string
          description_en: string | null
          fee: number
          id: string
          published: boolean
          sort_order: number
          title: string
          title_en: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          description_en?: string | null
          fee?: number
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          title_en?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          description_en?: string | null
          fee?: number
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          title_en?: string | null
        }
        Relationships: []
      }
      partnership_payment_settings: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          enabled: boolean
          id: boolean
          instructions: string
          instructions_en: string | null
          updated_at: string
        }
        Insert: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          enabled?: boolean
          id?: boolean
          instructions?: string
          instructions_en?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          enabled?: boolean
          id?: boolean
          instructions?: string
          instructions_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          body_en: string | null
          created_at: string
          excerpt: string
          excerpt_en: string | null
          id: string
          image_caption: string
          image_caption_en: string | null
          image_thumb_url: string
          image_url: string
          published: boolean
          published_on: string
          source_name: string
          source_url: string
          tag: string
          tag_en: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          body?: string
          body_en?: string | null
          created_at?: string
          excerpt?: string
          excerpt_en?: string | null
          id?: string
          image_caption?: string
          image_caption_en?: string | null
          image_thumb_url?: string
          image_url?: string
          published?: boolean
          published_on?: string
          source_name?: string
          source_url?: string
          tag?: string
          tag_en?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          body_en?: string | null
          created_at?: string
          excerpt?: string
          excerpt_en?: string | null
          id?: string
          image_caption?: string
          image_caption_en?: string | null
          image_thumb_url?: string
          image_url?: string
          published?: boolean
          published_on?: string
          source_name?: string
          source_url?: string
          tag?: string
          tag_en?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      public_event_registration_counts: {
        Args: never
        Returns: {
          event_id: string
          participants: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      lead_status: "new" | "contacted" | "consulting" | "enrolled" | "lost"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
      lead_status: ["new", "contacted", "consulting", "enrolled", "lost"],
    },
  },
} as const
