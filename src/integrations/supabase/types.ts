export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_meal_plans: {
        Row: {
          allergies: string[] | null
          calorie_goal: number | null
          carb_goal: number | null
          created_at: string
          diet_type: string | null
          fat_goal: number | null
          id: string
          meal_plan: Json
          meals_per_day: number | null
          protein_goal: number | null
          shopping_list: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          calorie_goal?: number | null
          carb_goal?: number | null
          created_at?: string
          diet_type?: string | null
          fat_goal?: number | null
          id?: string
          meal_plan: Json
          meals_per_day?: number | null
          protein_goal?: number | null
          shopping_list?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          calorie_goal?: number | null
          carb_goal?: number | null
          created_at?: string
          diet_type?: string | null
          fat_goal?: number | null
          id?: string
          meal_plan?: Json
          meals_per_day?: number | null
          protein_goal?: number | null
          shopping_list?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_progress_analysis: {
        Row: {
          analysis_text: string
          created_at: string
          id: string
          measurements: Json | null
          progress_images: string[] | null
          recommendations: string | null
          title: string
          user_id: string
        }
        Insert: {
          analysis_text: string
          created_at?: string
          id?: string
          measurements?: Json | null
          progress_images?: string[] | null
          recommendations?: string | null
          title: string
          user_id: string
        }
        Update: {
          analysis_text?: string
          created_at?: string
          id?: string
          measurements?: Json | null
          progress_images?: string[] | null
          recommendations?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workout_plans: {
        Row: {
          available_equipment: string[] | null
          created_at: string
          description: string | null
          experience_level: string | null
          goals: string | null
          id: string
          injuries: string | null
          session_length: number | null
          title: string
          training_days: number | null
          updated_at: string
          user_id: string
          workout_plan: Json
        }
        Insert: {
          available_equipment?: string[] | null
          created_at?: string
          description?: string | null
          experience_level?: string | null
          goals?: string | null
          id?: string
          injuries?: string | null
          session_length?: number | null
          title: string
          training_days?: number | null
          updated_at?: string
          user_id: string
          workout_plan: Json
        }
        Update: {
          available_equipment?: string[] | null
          created_at?: string
          description?: string | null
          experience_level?: string | null
          goals?: string | null
          id?: string
          injuries?: string | null
          session_length?: number | null
          title?: string
          training_days?: number | null
          updated_at?: string
          user_id?: string
          workout_plan?: Json
        }
        Relationships: []
      }
      cookie_consent: {
        Row: {
          analytics_cookies: boolean
          consent_timestamp: string
          created_at: string
          essential_cookies: boolean
          id: string
          marketing_cookies: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_cookies?: boolean
          consent_timestamp?: string
          created_at?: string
          essential_cookies?: boolean
          id?: string
          marketing_cookies?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_cookies?: boolean
          consent_timestamp?: string
          created_at?: string
          essential_cookies?: boolean
          id?: string
          marketing_cookies?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_steps: {
        Row: {
          created_at: string
          date: string
          id: string
          source: string
          steps: number
          synced_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          source: string
          steps?: number
          synced_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          source?: string
          steps?: number
          synced_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          created_at: string
          date: string
          food_item: Json
          id: string
          meal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          food_item: Json
          id?: string
          meal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          food_item?: Json
          id?: string
          meal_id?: string
          user_id?: string
        }
        Relationships: []
      }
      health_connections: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_active: boolean
          provider: string
          provider_user_id: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          provider_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          provider_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          measurement_system: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          measurement_system?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          measurement_system?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_daily_steps: {
        Args: { user_uuid: string }
        Returns: number
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
