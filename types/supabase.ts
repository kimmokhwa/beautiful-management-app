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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      consultant_sales: {
        Row: {
          consultant_name: string
          consultant_sales: number
          created_at: string | null
          date: string
          id: number
          updated_at: string | null
        }
        Insert: {
          consultant_name: string
          consultant_sales?: number
          created_at?: string | null
          date: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          consultant_name?: string
          consultant_sales?: number
          created_at?: string | null
          date?: string
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      consultant_targets: {
        Row: {
          achieved_amount: number | null
          achievement_rate: number | null
          consultant_id: string
          created_at: string | null
          current_tier: number | null
          expected_incentive: number | null
          id: number
          status: string | null
          target_amount: number
          updated_at: string | null
          year_month: string
        }
        Insert: {
          achieved_amount?: number | null
          achievement_rate?: number | null
          consultant_id: string
          created_at?: string | null
          current_tier?: number | null
          expected_incentive?: number | null
          id?: number
          status?: string | null
          target_amount?: number
          updated_at?: string | null
          year_month: string
        }
        Update: {
          achieved_amount?: number | null
          achievement_rate?: number | null
          consultant_id?: string
          created_at?: string | null
          current_tier?: number | null
          expected_incentive?: number | null
          id?: number
          status?: string | null
          target_amount?: number
          updated_at?: string | null
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultant_targets_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          team: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          team?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          team?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_procedures: {
        Row: {
          created_at: string | null
          goal_count: number
          id: number
          procedure_id: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          goal_count?: number
          id?: number
          procedure_id?: number | null
          type?: string
        }
        Update: {
          created_at?: string | null
          goal_count?: number
          id?: number
          procedure_id?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_procedures_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_settings: {
        Row: {
          consultant_goals: Json
          created_at: string | null
          current_work_day: number
          hospital_goal: number
          id: number
          month_year: string
          total_work_days: number
          updated_at: string | null
        }
        Insert: {
          consultant_goals?: Json
          created_at?: string | null
          current_work_day?: number
          hospital_goal?: number
          id?: number
          month_year: string
          total_work_days?: number
          updated_at?: string | null
        }
        Update: {
          consultant_goals?: Json
          created_at?: string | null
          current_work_day?: number
          hospital_goal?: number
          id?: number
          month_year?: string
          total_work_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      hospital_sales: {
        Row: {
          created_at: string | null
          date: string
          hospital_sales: number
          id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hospital_sales?: number
          id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hospital_sales?: number
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      incentive_calculations: {
        Row: {
          calculated_at: string | null
          consultant_name: string
          created_at: string | null
          id: number
          incentive_amount: number
          incentive_rate: number
          month: number
          total_sales: number
          year: number
        }
        Insert: {
          calculated_at?: string | null
          consultant_name: string
          created_at?: string | null
          id?: number
          incentive_amount?: number
          incentive_rate?: number
          month: number
          total_sales?: number
          year: number
        }
        Update: {
          calculated_at?: string | null
          consultant_name?: string
          created_at?: string | null
          id?: number
          incentive_amount?: number
          incentive_rate?: number
          month?: number
          total_sales?: number
          year?: number
        }
        Relationships: []
      }
      incentive_settings: {
        Row: {
          bonus_config: Json
          created_at: string | null
          created_by: string
          effective_date: string
          id: number
          is_active: boolean | null
          tier_config: Json
        }
        Insert: {
          bonus_config?: Json
          created_at?: string | null
          created_by: string
          effective_date?: string
          id?: number
          is_active?: boolean | null
          tier_config?: Json
        }
        Update: {
          bonus_config?: Json
          created_at?: string | null
          created_by?: string
          effective_date?: string
          id?: number
          is_active?: boolean | null
          tier_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "incentive_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          cost: number
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          cost?: number
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      month_locks: {
        Row: {
          created_at: string | null
          id: number
          is_locked: boolean | null
          locked_at: string | null
          locked_by: string | null
          month: number
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          month: number
          year: number
        }
        Update: {
          created_at?: string | null
          id?: number
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          month?: number
          year?: number
        }
        Relationships: []
      }
      monthly_calendar_data: {
        Row: {
          calendar_data: Json
          created_at: string | null
          id: number
          month_key: string
          updated_at: string | null
        }
        Insert: {
          calendar_data?: Json
          created_at?: string | null
          id?: number
          month_key: string
          updated_at?: string | null
        }
        Update: {
          calendar_data?: Json
          created_at?: string | null
          id?: number
          month_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_details: {
        Row: {
          chart_number: string | null
          created_at: string | null
          doctor_name: string | null
          id: number
          order_date: string
          order_name: string
          patient_name: string
          price: number
          staff_name: string | null
        }
        Insert: {
          chart_number?: string | null
          created_at?: string | null
          doctor_name?: string | null
          id?: number
          order_date: string
          order_name: string
          patient_name: string
          price?: number
          staff_name?: string | null
        }
        Update: {
          chart_number?: string | null
          created_at?: string | null
          doctor_name?: string | null
          id?: number
          order_date?: string
          order_name?: string
          patient_name?: string
          price?: number
          staff_name?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          chart_number: string | null
          consultant_id: string
          consultant_name: string
          created_at: string | null
          department: string | null
          doctor_name: string | null
          id: number
          notes: string | null
          order_code: string | null
          order_date: string
          order_name: string
          patient_name: string
          phone_number: string | null
          quantity: number
          total_amount: number
          treatment: string | null
          unit_price: number
          updated_at: string | null
          visit_path: string | null
          visit_type: string
        }
        Insert: {
          chart_number?: string | null
          consultant_id: string
          consultant_name: string
          created_at?: string | null
          department?: string | null
          doctor_name?: string | null
          id?: number
          notes?: string | null
          order_code?: string | null
          order_date: string
          order_name: string
          patient_name: string
          phone_number?: string | null
          quantity?: number
          total_amount?: number
          treatment?: string | null
          unit_price?: number
          updated_at?: string | null
          visit_path?: string | null
          visit_type?: string
        }
        Update: {
          chart_number?: string | null
          consultant_id?: string
          consultant_name?: string
          created_at?: string | null
          department?: string | null
          doctor_name?: string | null
          id?: number
          notes?: string | null
          order_code?: string | null
          order_date?: string
          order_name?: string
          patient_name?: string
          phone_number?: string | null
          quantity?: number
          total_amount?: number
          treatment?: string | null
          unit_price?: number
          updated_at?: string | null
          visit_path?: string | null
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_list: {
        Row: {
          amount: number
          chart_number: string | null
          consultant_name: string | null
          created_at: string | null
          id: number
          patient_name: string
          phone_number: string | null
          treatment_type: string | null
          visit_date: string
        }
        Insert: {
          amount?: number
          chart_number?: string | null
          consultant_name?: string | null
          created_at?: string | null
          id?: number
          patient_name: string
          phone_number?: string | null
          treatment_type?: string | null
          visit_date: string
        }
        Update: {
          amount?: number
          chart_number?: string | null
          consultant_name?: string | null
          created_at?: string | null
          id?: number
          patient_name?: string
          phone_number?: string | null
          treatment_type?: string | null
          visit_date?: string
        }
        Relationships: []
      }
      procedures: {
        Row: {
          category: string
          created_at: string | null
          customer_price: number
          id: number
          materials: string[] | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          customer_price?: number
          id?: number
          materials?: string[] | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          customer_price?: number
          id?: number
          materials?: string[] | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          manager_id: string | null
          phone_number: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          manager_id?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          manager_id?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_info: {
        Row: {
          id: number
          last_updated: string | null
          total_materials: number | null
          total_procedures: number | null
        }
        Insert: {
          id?: number
          last_updated?: string | null
          total_materials?: number | null
          total_procedures?: number | null
        }
        Update: {
          id?: number
          last_updated?: string | null
          total_materials?: number | null
          total_procedures?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      upload_history: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_rows: number | null
          file_name: string
          file_size: number
          id: number
          processed_rows: number | null
          status: string | null
          success_rows: number | null
          upload_date: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_rows?: number | null
          file_name: string
          file_size: number
          id?: number
          processed_rows?: number | null
          status?: string | null
          success_rows?: number | null
          upload_date?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_rows?: number | null
          file_name?: string
          file_size?: number
          id?: number
          processed_rows?: number | null
          status?: string | null
          success_rows?: number | null
          upload_date?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_history_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string | null
          file_data: Json
          file_name: string
          file_type: string
          id: number
          upload_date: string | null
        }
        Insert: {
          created_at?: string | null
          file_data: Json
          file_name: string
          file_type: string
          id?: number
          upload_date?: string | null
        }
        Update: {
          created_at?: string | null
          file_data?: Json
          file_name?: string
          file_type?: string
          id?: number
          upload_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_sales: {
        Row: {
          average_price: number | null
          consultant_id: string | null
          consultant_name: string | null
          max_order_amount: number | null
          min_order_amount: number | null
          new_patients: number | null
          order_count: number | null
          order_date: string | null
          revisits: number | null
          total_sales: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_performance: {
        Row: {
          achieved_count: number | null
          at_risk_count: number | null
          avg_achievement_rate: number | null
          total_achieved: number | null
          total_consultants: number | null
          total_incentive: number | null
          total_target: number | null
          year_month: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_incentive_amount: {
        Args: { p_new_patients?: number; p_sales_amount: number }
        Returns: number
      }
      create_admin_profile: {
        Args: { p_email: string; p_full_name: string; p_user_id: string }
        Returns: undefined
      }
      update_consultant_targets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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