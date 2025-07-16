export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          extensions?: Json
          variables?: Json
          query?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type_id: string | null
          calories_burned: number | null
          check_in_time: string
          check_out_time: string | null
          company_id: string
          created_at: string
          data: Json | null
          distance_km: number | null
          duration_minutes: number | null
          facility_id: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type_id?: string | null
          calories_burned?: number | null
          check_in_time: string
          check_out_time?: string | null
          company_id: string
          created_at?: string
          data?: Json | null
          distance_km?: number | null
          duration_minutes?: number | null
          facility_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type_id?: string | null
          calories_burned?: number | null
          check_in_time?: string
          check_out_time?: string | null
          company_id?: string
          created_at?: string
          data?: Json | null
          distance_km?: number | null
          duration_minutes?: number | null
          facility_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility_usage_summary"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "fk_activity_logs_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activity_logs_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      activity_types: {
        Row: {
          calories_per_hour: number | null
          category: string
          code: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          equipment_required: Json | null
          facility_id: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          calories_per_hour?: number | null
          category: string
          code: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          equipment_required?: Json | null
          facility_id: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          calories_per_hour?: number | null
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          equipment_required?: Json | null
          facility_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_types_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_types_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility_usage_summary"
            referencedColumns: ["facility_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          code: string
          company_id: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      companies: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_users: {
        Row: {
          branch_id: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: string | null
          branch_id: string | null
          code: string
          company_id: string
          created_at: string
          email: string | null
          facility_type: string
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          opening_hours: Json | null
          phone: string | null
          qr_code: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          code: string
          company_id: string
          created_at?: string
          email?: string | null
          facility_type: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          qr_code: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          code?: string
          company_id?: string
          created_at?: string
          email?: string | null
          facility_type?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          qr_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      measurements: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          company_id: string | null
          created_at: string
          facility_id: string | null
          id: string
          measurement_date: string
          measurements: Json | null
          muscle_mass: number | null
          notes: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          company_id?: string | null
          created_at?: string
          facility_id?: string | null
          id?: string
          measurement_date?: string
          measurements?: Json | null
          muscle_mass?: number | null
          notes?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          company_id?: string | null
          created_at?: string
          facility_id?: string | null
          id?: string
          measurement_date?: string
          measurements?: Json | null
          muscle_mass?: number | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_measurements_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_measurements_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "measurements_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurements_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility_usage_summary"
            referencedColumns: ["facility_id"]
          },
        ]
      }
      point_rules: {
        Row: {
          activity_category: string | null
          bonus_conditions: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          point_system_id: string
          points_per_minute: number | null
          points_per_session: number | null
          updated_at: string
        }
        Insert: {
          activity_category?: string | null
          bonus_conditions?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          point_system_id: string
          points_per_minute?: number | null
          points_per_session?: number | null
          updated_at?: string
        }
        Update: {
          activity_category?: string | null
          bonus_conditions?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          point_system_id?: string
          points_per_minute?: number | null
          points_per_session?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_rules_point_system_id_fkey"
            columns: ["point_system_id"]
            isOneToOne: false
            referencedRelation: "point_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      point_systems: {
        Row: {
          company_id: string
          conversion_rate: number | null
          created_at: string
          expiration_months: number | null
          id: string
          is_active: boolean | null
          name: string
          point_unit: string
          rules: Json | null
          updated_at: string
        }
        Insert: {
          company_id: string
          conversion_rate?: number | null
          created_at?: string
          expiration_months?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          point_unit: string
          rules?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          conversion_rate?: number | null
          created_at?: string
          expiration_months?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          point_unit?: string
          rules?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_systems_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_systems_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          activity_log_id: string | null
          amount: number
          balance_after: number
          company_id: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          activity_log_id?: string | null
          amount: number
          balance_after: number
          company_id: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          activity_log_id?: string | null
          amount?: number
          balance_after?: number
          company_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      user_memberships: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          membership_number: string
          membership_type: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          membership_number: string
          membership_type: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          membership_number?: string
          membership_type?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      user_points: {
        Row: {
          company_id: string
          current_points: number | null
          id: string
          total_earned: number | null
          total_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          current_points?: number | null
          id?: string
          total_earned?: number | null
          total_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          current_points?: number | null
          id?: string
          total_earned?: number | null
          total_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_points_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          emergency_contact: Json | null
          gender: string | null
          id: string
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          emergency_contact?: Json | null
          gender?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          emergency_contact?: Json | null
          gender?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      company_activity_summary: {
        Row: {
          activity_date: string | null
          avg_duration_minutes: number | null
          company_id: string | null
          company_name: string | null
          facilities_used: number | null
          total_activities: number | null
          total_calories_burned: number | null
          total_duration_minutes: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      facility_usage_summary: {
        Row: {
          avg_duration_minutes: number | null
          company_id: string | null
          company_name: string | null
          facility_id: string | null
          facility_name: string | null
          total_duration_minutes: number | null
          total_visits: number | null
          unique_visitors: number | null
          usage_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
      point_system_summary: {
        Row: {
          active_users: number | null
          avg_points_per_user: number | null
          company_id: string | null
          company_name: string | null
          point_system_name: string | null
          point_unit: string | null
          total_points_earned: number | null
          total_points_outstanding: number | null
          total_points_used: number | null
        }
        Relationships: [
          {
            foreignKeyName: "point_systems_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_systems_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_activity_summary"
            referencedColumns: ["company_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_and_award_points: {
        Args: { user_id_input: string; activity_log_id_input: string }
        Returns: number
      }
      get_company_stats: {
        Args: { company_id_input: string; days_back?: number }
        Returns: {
          total_activities: number
          unique_users: number
          total_duration_hours: number
          total_calories: number
          avg_session_duration: number
          total_points_awarded: number
          active_members: number
        }[]
      }
      get_facility_by_qr_code: {
        Args: { qr_code_input: string }
        Returns: {
          facility_id: string
          facility_name: string
          company_name: string
          branch_name: string
          facility_type: string
          available_activities: Json
        }[]
      }
      get_facility_ranking: {
        Args: { company_id_input: string; days_back?: number }
        Returns: {
          facility_id: string
          facility_name: string
          total_visits: number
          unique_visitors: number
          total_duration_minutes: number
          avg_duration_minutes: number
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

