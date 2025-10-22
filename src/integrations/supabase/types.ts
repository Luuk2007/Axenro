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
      audit_logs: {
        Row: {
          id: string
          ip_address: unknown | null
          operation: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          operation: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          operation?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          created_at: string
          date: string
          id: string
          measurement_type: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          measurement_type: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          measurement_type?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      challenge_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          challenge_id: string
          completion_percentage: number
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          challenge_id: string
          completion_percentage: number
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          challenge_id?: string
          completion_percentage?: number
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_badges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          target_user_id: string
          user_challenge_id: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          target_user_id: string
          user_challenge_id: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          target_user_id?: string
          user_challenge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_interactions_user_challenge_id_fkey"
            columns: ["user_challenge_id"]
            isOneToOne: false
            referencedRelation: "user_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_progress: {
        Row: {
          completed_at: string
          created_at: string
          day_number: number
          id: string
          notes: string | null
          photo_url: string | null
          user_challenge_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          day_number: number
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_challenge_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          day_number?: number
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_challenge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_user_challenge_id_fkey"
            columns: ["user_challenge_id"]
            isOneToOne: false
            referencedRelation: "user_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_bronze_threshold: number
          badge_gold_threshold: number
          badge_silver_threshold: number
          category: string
          created_at: string
          creator_id: string | null
          description: string
          difficulty_level: Database["public"]["Enums"]["challenge_difficulty"]
          duration_days: number
          id: string
          is_public: boolean
          title: string
          updated_at: string
        }
        Insert: {
          badge_bronze_threshold?: number
          badge_gold_threshold?: number
          badge_silver_threshold?: number
          category?: string
          created_at?: string
          creator_id?: string | null
          description: string
          difficulty_level?: Database["public"]["Enums"]["challenge_difficulty"]
          duration_days: number
          id?: string
          is_public?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          badge_bronze_threshold?: number
          badge_gold_threshold?: number
          badge_silver_threshold?: number
          category?: string
          created_at?: string
          creator_id?: string | null
          description?: string
          difficulty_level?: Database["public"]["Enums"]["challenge_difficulty"]
          duration_days?: number
          id?: string
          is_public?: boolean
          title?: string
          updated_at?: string
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
      custom_exercises: {
        Row: {
          created_at: string
          id: string
          muscle_group: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_meals: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
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
      deleted_meals: {
        Row: {
          created_at: string
          id: string
          meal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_id?: string
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
      measurement_types: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          is_custom: boolean
          measurement_id: string
          name: string
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          is_custom?: boolean
          measurement_id: string
          name: string
          unit: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          is_custom?: boolean
          measurement_id?: string
          name?: string
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          created_at: string
          date: string
          food_data: Json
          id: string
          meal_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          food_data: Json
          id?: string
          meal_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          food_data?: Json
          id?: string
          meal_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          created_at: string
          date: string
          exercise_name: string
          id: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          exercise_name: string
          id?: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          exercise_name?: string
          id?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      planned_workouts: {
        Row: {
          created_at: string
          date: string
          estimated_duration: number | null
          id: string
          muscle_groups: string[] | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          estimated_duration?: number | null
          id?: string
          muscle_groups?: string[] | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          estimated_duration?: number | null
          id?: string
          muscle_groups?: string[] | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_avatar_generated_at: string | null
          ai_avatar_status: string | null
          ai_avatar_url: string | null
          full_name: string | null
          id: string
          last_motivation_generated_at: string | null
          last_motivation_message: string | null
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          ai_avatar_generated_at?: string | null
          ai_avatar_status?: string | null
          ai_avatar_url?: string | null
          full_name?: string | null
          id: string
          last_motivation_generated_at?: string | null
          last_motivation_message?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_avatar_generated_at?: string | null
          ai_avatar_status?: string | null
          ai_avatar_url?: string | null
          full_name?: string | null
          id?: string
          last_motivation_generated_at?: string | null
          last_motivation_message?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          category: string
          created_at: string
          date: string
          id: string
          image_url: string
          is_favorite: boolean
          is_milestone: boolean
          notes: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          id?: string
          image_url: string
          is_favorite?: boolean
          is_milestone?: boolean
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          image_url?: string
          is_favorite?: boolean
          is_milestone?: boolean
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          function_name: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_whitelisted: boolean
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          test_mode: boolean
          test_subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_whitelisted?: boolean
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          test_mode?: boolean
          test_subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_whitelisted?: boolean
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          test_mode?: boolean
          test_subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_day: number
          id: string
          joined_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_day?: number
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_day?: number
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
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
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          exercise_frequency: string | null
          fitness_goal: string | null
          gender: string | null
          height: number | null
          id: string
          name: string | null
          target_weight: number | null
          updated_at: string
          user_id: string
          weekly_workout_goal: number | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          exercise_frequency?: string | null
          fitness_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id: string
          weekly_workout_goal?: number | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          exercise_frequency?: string | null
          fitness_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
          weekly_workout_goal?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          data_backup: boolean
          id: string
          language: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_backup?: boolean
          id?: string
          language?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_backup?: boolean
          id?: string
          language?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_tracking: {
        Row: {
          created_at: string
          date: string
          entries: Json
          id: string
          total_water: number
          updated_at: string
          user_id: string
          water_goal: number
        }
        Insert: {
          created_at?: string
          date: string
          entries?: Json
          id?: string
          total_water?: number
          updated_at?: string
          user_id: string
          water_goal?: number
        }
        Update: {
          created_at?: string
          date?: string
          entries?: Json
          id?: string
          total_water?: number
          updated_at?: string
          user_id?: string
          water_goal?: number
        }
        Relationships: []
      }
      weight_data: {
        Row: {
          created_at: string
          date: string
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      workouts: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          exercises: Json
          id: string
          name: string
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          exercises?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          exercises?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: []
      }
      workouts_data: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          exercises: Json
          id: string
          name: string
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          exercises: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          exercises?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          workout_id?: string
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
      badge_type: "bronze" | "silver" | "gold"
      challenge_difficulty: "easy" | "medium" | "hard"
      challenge_status: "active" | "completed" | "abandoned"
      interaction_type: "like" | "comment" | "cheer"
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
      badge_type: ["bronze", "silver", "gold"],
      challenge_difficulty: ["easy", "medium", "hard"],
      challenge_status: ["active", "completed", "abandoned"],
      interaction_type: ["like", "comment", "cheer"],
    },
  },
} as const
