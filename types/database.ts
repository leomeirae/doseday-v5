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
      android_waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      consent_history: {
        Row: {
          consent_type: string
          created_at: string | null
          granted: boolean | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          granted?: boolean | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
          version: string
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          granted?: boolean | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string | null
          current_dose_mg: number | null
          data_quality_score: number | null
          date: string
          days_since_last_dose: number | null
          details: Json | null
          emotional_intensity: number | null
          emotional_state: string | null
          has_adverse_reaction: boolean | null
          id: string
          notes: string | null
          symptom_details: Json | null
          symptom_triggers: string[] | null
          symptoms: string[] | null
          symptoms_intensity: Json | null
          treatment_week: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_dose_mg?: number | null
          data_quality_score?: number | null
          date: string
          days_since_last_dose?: number | null
          details?: Json | null
          emotional_intensity?: number | null
          emotional_state?: string | null
          has_adverse_reaction?: boolean | null
          id?: string
          notes?: string | null
          symptom_details?: Json | null
          symptom_triggers?: string[] | null
          symptoms?: string[] | null
          symptoms_intensity?: Json | null
          treatment_week?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_dose_mg?: number | null
          data_quality_score?: number | null
          date?: string
          days_since_last_dose?: number | null
          details?: Json | null
          emotional_intensity?: number | null
          emotional_state?: string | null
          has_adverse_reaction?: boolean | null
          id?: string
          notes?: string | null
          symptom_details?: Json | null
          symptom_triggers?: string[] | null
          symptoms?: string[] | null
          symptoms_intensity?: Json | null
          treatment_week?: number | null
          user_id?: string
        }
        Relationships: []
      }
      educational_insights: {
        Row: {
          body: string
          context: Json
          created_at: string
          disclaimer: string
          headline: string
          id: string
          model: string
          prompt_version: string
          trigger_source: string
          user_id: string
        }
        Insert: {
          body: string
          context?: Json
          created_at?: string
          disclaimer: string
          headline: string
          id?: string
          model?: string
          prompt_version?: string
          trigger_source: string
          user_id: string
        }
        Update: {
          body?: string
          context?: Json
          created_at?: string
          disclaimer?: string
          headline?: string
          id?: string
          model?: string
          prompt_version?: string
          trigger_source?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      lifestyle_logs: {
        Row: {
          checkin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          log_date: string
          log_type: string
          user_id: string
        }
        Insert: {
          checkin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          log_date: string
          log_type: string
          user_id: string
        }
        Update: {
          checkin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          log_date?: string
          log_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifestyle_logs_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "daily_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      lifestyle_triggers: {
        Row: {
          checkin_id: string | null
          created_at: string | null
          id: string
          log_date: string
          notes: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          checkin_id?: string | null
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          trigger_type: string
          user_id: string
        }
        Update: {
          checkin_id?: string | null
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifestyle_triggers_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "daily_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_reports: {
        Row: {
          clinical_summary: string | null
          created_at: string | null
          id: string
          pdf_generated_at: string | null
          pdf_url: string | null
          period_end: string
          period_start: string
          report_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clinical_summary?: string | null
          created_at?: string | null
          id?: string
          pdf_generated_at?: string | null
          pdf_url?: string | null
          period_end: string
          period_start: string
          report_data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clinical_summary?: string | null
          created_at?: string | null
          id?: string
          pdf_generated_at?: string | null
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          report_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_visits: {
        Row: {
          attachments: Json | null
          created_at: string | null
          current_dose_mg: number | null
          doctor_name: string | null
          doctor_notes: string | null
          id: string
          next_visit_date: string | null
          recommendations: Json | null
          updated_at: string | null
          user_id: string
          visit_date: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          current_dose_mg?: number | null
          doctor_name?: string | null
          doctor_notes?: string | null
          id?: string
          next_visit_date?: string | null
          recommendations?: Json | null
          updated_at?: string | null
          user_id: string
          visit_date: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          current_dose_mg?: number | null
          doctor_name?: string | null
          doctor_notes?: string | null
          id?: string
          next_visit_date?: string | null
          recommendations?: Json | null
          updated_at?: string | null
          user_id?: string
          visit_date?: string
        }
        Relationships: []
      }
      medication_applications: {
        Row: {
          application_date: string
          created_at: string | null
          days_until_next_dose: number
          dose: number
          id: string
          injection_site: string | null
          medication_name: string
          notes: string | null
          side_effects: string[] | null
          user_id: string
        }
        Insert: {
          application_date: string
          created_at?: string | null
          days_until_next_dose?: number
          dose: number
          id?: string
          injection_site?: string | null
          medication_name: string
          notes?: string | null
          side_effects?: string[] | null
          user_id: string
        }
        Update: {
          application_date?: string
          created_at?: string | null
          days_until_next_dose?: number
          dose?: number
          id?: string
          injection_site?: string | null
          medication_name?: string
          notes?: string | null
          side_effects?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      memory_daily_insights: {
        Row: {
          data_window_end: string
          data_window_start: string
          generated_at: string
          id: string
          insight_text: string
          user_id: string
        }
        Insert: {
          data_window_end: string
          data_window_start: string
          generated_at?: string
          id?: string
          insight_text: string
          user_id: string
        }
        Update: {
          data_window_end?: string
          data_window_start?: string
          generated_at?: string
          id?: string
          insight_text?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_summaries: {
        Row: {
          content: Json
          generated_at: string
          id: string
          mode: string
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          content: Json
          generated_at?: string
          id?: string
          mode: string
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          generated_at?: string
          id?: string
          mode?: string
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          screen_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          screen_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          screen_name?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_ai_questions: {
        Row: {
          answer_value: string | null
          answered_at: string | null
          created_at: string
          expires_at: string
          id: string
          options: Json
          question_text: string
          question_type: string
          trigger_context: Json | null
          trigger_reason: string
          user_id: string
        }
        Insert: {
          answer_value?: string | null
          answered_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          options: Json
          question_text: string
          question_type: string
          trigger_context?: Json | null
          trigger_reason: string
          user_id: string
        }
        Update: {
          answer_value?: string | null
          answered_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          options?: Json
          question_text?: string
          question_type?: string
          trigger_context?: Json | null
          trigger_reason?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          intended_dose: number | null
          item_name: string | null
          medication_name: string | null
          notes: string | null
          price: number
          purchase_date: string
          purchase_location: string | null
          quantity: number
          unit: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          intended_dose?: number | null
          item_name?: string | null
          medication_name?: string | null
          notes?: string | null
          price: number
          purchase_date: string
          purchase_location?: string | null
          quantity: number
          unit?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          intended_dose?: number | null
          item_name?: string | null
          medication_name?: string | null
          notes?: string | null
          price?: number
          purchase_date?: string
          purchase_location?: string | null
          quantity?: number
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      push_automations: {
        Row: {
          active: boolean
          body: string
          created_at: string
          id: string
          inactivity_days: number | null
          last_triggered_at: string | null
          media_url: string | null
          name: string
          title: string
          total_sent: number | null
          trigger_type: string
          updated_at: string
          version_number: string | null
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          id?: string
          inactivity_days?: number | null
          last_triggered_at?: string | null
          media_url?: string | null
          name: string
          title: string
          total_sent?: number | null
          trigger_type: string
          updated_at?: string
          version_number?: string | null
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          inactivity_days?: number | null
          last_triggered_at?: string | null
          media_url?: string | null
          name?: string
          title?: string
          total_sent?: number | null
          trigger_type?: string
          updated_at?: string
          version_number?: string | null
        }
        Relationships: []
      }
      push_schedules: {
        Row: {
          active: boolean
          body: string
          created_at: string
          frequency_days: number
          id: string
          last_run_at: string | null
          last_run_count: number | null
          media_url: string | null
          name: string
          next_run_at: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          frequency_days?: number
          id?: string
          last_run_at?: string | null
          last_run_count?: number | null
          media_url?: string | null
          name: string
          next_run_at: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          frequency_days?: number
          id?: string
          last_run_at?: string | null
          last_run_count?: number | null
          media_url?: string | null
          name?: string
          next_run_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_logs: {
        Row: {
          created_at: string | null
          id: string
          intensity: number | null
          log_type: string
          logged_at: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          intensity?: number | null
          log_type: string
          logged_at?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          intensity?: number | null
          log_type?: string
          logged_at?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          checkin_id: string | null
          context: Json | null
          created_at: string | null
          days_since_dose: number | null
          id: string
          intensity: number
          logged_at: string | null
          notes: string | null
          onset_time: string | null
          severity: number | null
          symptom_date: string
          symptom_type: string
          user_id: string
        }
        Insert: {
          checkin_id?: string | null
          context?: Json | null
          created_at?: string | null
          days_since_dose?: number | null
          id?: string
          intensity: number
          logged_at?: string | null
          notes?: string | null
          onset_time?: string | null
          severity?: number | null
          symptom_date: string
          symptom_type: string
          user_id: string
        }
        Update: {
          checkin_id?: string | null
          context?: Json | null
          created_at?: string | null
          days_since_dose?: number | null
          id?: string
          intensity?: number
          logged_at?: string | null
          notes?: string | null
          onset_time?: string | null
          severity?: number | null
          symptom_date?: string
          symptom_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_logs_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "daily_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          biological_sex: string | null
          created_at: string | null
          current_dose: number | null
          current_medication: string | null
          current_weight: number | null
          doctor_name: string | null
          exp_push_token: string | null
          full_name: string | null
          goal_weight: number | null
          has_medical_support: string | null
          has_seen_push_permission_modal: boolean
          height: number | null
          id: string
          initial_weight: number | null
          last_report_generated_at: string | null
          locale: string
          main_concerns: string[] | null
          next_appointment_date: string | null
          onboarding_completed_at: string | null
          preferred_day_of_week: number | null
          preferred_time: string | null
          smart_weight_reminder: boolean | null
          treatment_duration: string | null
          treatment_start_date: string | null
          treatment_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          biological_sex?: string | null
          created_at?: string | null
          current_dose?: number | null
          current_medication?: string | null
          current_weight?: number | null
          doctor_name?: string | null
          exp_push_token?: string | null
          full_name?: string | null
          goal_weight?: number | null
          has_medical_support?: string | null
          has_seen_push_permission_modal?: boolean
          height?: number | null
          id?: string
          initial_weight?: number | null
          last_report_generated_at?: string | null
          locale?: string
          main_concerns?: string[] | null
          next_appointment_date?: string | null
          onboarding_completed_at?: string | null
          preferred_day_of_week?: number | null
          preferred_time?: string | null
          smart_weight_reminder?: boolean | null
          treatment_duration?: string | null
          treatment_start_date?: string | null
          treatment_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          biological_sex?: string | null
          created_at?: string | null
          current_dose?: number | null
          current_medication?: string | null
          current_weight?: number | null
          doctor_name?: string | null
          exp_push_token?: string | null
          full_name?: string | null
          goal_weight?: number | null
          has_medical_support?: string | null
          has_seen_push_permission_modal?: boolean
          height?: number | null
          id?: string
          initial_weight?: number | null
          last_report_generated_at?: string | null
          locale?: string
          main_concerns?: string[] | null
          next_appointment_date?: string | null
          onboarding_completed_at?: string | null
          preferred_day_of_week?: number | null
          preferred_time?: string | null
          smart_weight_reminder?: boolean | null
          treatment_duration?: string | null
          treatment_start_date?: string | null
          treatment_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          dark_mode: boolean | null
          id: string
          notification_days: number[] | null
          notification_time: string | null
          notifications_enabled: boolean | null
          tour_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dark_mode?: boolean | null
          id?: string
          notification_days?: number[] | null
          notification_time?: string | null
          notifications_enabled?: boolean | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dark_mode?: boolean | null
          id?: string
          notification_days?: number[] | null
          notification_time?: string | null
          notifications_enabled?: boolean | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          app_user_id: string
          cancel_reason: string | null
          created_at: string
          entitlement_id: string | null
          expires_date: string | null
          id: string
          original_transaction_id: string | null
          product_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          app_user_id: string
          cancel_reason?: string | null
          created_at?: string
          entitlement_id?: string | null
          expires_date?: string | null
          id?: string
          original_transaction_id?: string | null
          product_id?: string | null
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          app_user_id?: string
          cancel_reason?: string | null
          created_at?: string
          entitlement_id?: string | null
          expires_date?: string | null
          id?: string
          original_transaction_id?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      checkin_streaks: {
        Row: {
          current_streak: number | null
          longest_streak: number | null
          user_id: string | null
        }
        Relationships: []
      }
      educational_insights_quality_view: {
        Row: {
          avg_body_length: number | null
          avg_headline_length: number | null
          first_seen: string | null
          insights_count: number | null
          last_seen: string | null
          model: string | null
          prompt_version: string | null
          trigger_source: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      insights_pipeline_view: {
        Row: {
          first_checkin_gpt_success_rate_pct: number | null
          first_checkin_insights_persisted: number | null
          onboarding_gpt_success_rate_pct: number | null
          onboarding_insights_persisted: number | null
          users_completed_onboarding: number | null
          users_with_at_least_one_checkin: number | null
        }
        Relationships: []
      }
      onboarding_funnel_view: {
        Row: {
          completed: number | null
          completion_rate_pct: number | null
          screen_name: string | null
          viewed: number | null
        }
        Relationships: []
      }
      symptom_dose_correlation: {
        Row: {
          alcohol_related: boolean | null
          context: Json | null
          days_since_dose: number | null
          dose_window: string | null
          intensity: number | null
          symptom_date: string | null
          symptom_type: string | null
          user_id: string | null
        }
        Insert: {
          alcohol_related?: never
          context?: Json | null
          days_since_dose?: number | null
          dose_window?: never
          intensity?: number | null
          symptom_date?: string | null
          symptom_type?: string | null
          user_id?: string | null
        }
        Update: {
          alcohol_related?: never
          context?: Json | null
          days_since_dose?: number | null
          dose_window?: never
          intensity?: number | null
          symptom_date?: string | null
          symptom_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_user: { Args: never; Returns: undefined }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_push_users: {
        Args: never
        Returns: {
          created_at: string
          exp_push_token: string
          full_name: string
          id: string
        }[]
      }
      get_users_for_scheduling: {
        Args: { check_date?: string }
        Returns: {
          days_in_treatment: number
          needs_report: boolean
          user_id: string
        }[]
      }
      has_minimum_profile: { Args: { p_user_id: string }; Returns: boolean }
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
