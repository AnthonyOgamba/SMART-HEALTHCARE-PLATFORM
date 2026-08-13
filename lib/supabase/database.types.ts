export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ConsentType = 'health_data' | 'ai_processing' | 'notifications';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string;
          phone: string | null;
          date_of_birth: string | null;
          emergency_contact_name: string | null;
          emergency_contact_relationship: string | null;
          emergency_contact_phone: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          phone?: string | null;
          date_of_birth?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_relationship?: string | null;
          emergency_contact_phone?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_relationship?: string | null;
          emergency_contact_phone?: string | null;
          timezone?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          medication_reminders: boolean;
          appointment_reminders: boolean;
          critical_alerts: boolean;
          ai_enabled: boolean;
          daily_activity_goal_minutes: number | null;
          appearance: 'light' | 'dark';
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          medication_reminders?: boolean;
          appointment_reminders?: boolean;
          critical_alerts?: boolean;
          ai_enabled?: boolean;
          daily_activity_goal_minutes?: number | null;
          appearance?: 'light' | 'dark';
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          medication_reminders?: boolean;
          appointment_reminders?: boolean;
          critical_alerts?: boolean;
          ai_enabled?: boolean;
          daily_activity_goal_minutes?: number | null;
          appearance?: 'light' | 'dark';
          onboarding_completed_at?: string | null;
        };
        Relationships: [];
      };
      consents: {
        Row: {
          id: string;
          user_id: string;
          consent_type: ConsentType;
          granted: boolean;
          policy_version: string;
          recorded_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      appointments: { Row: { id:string;user_id:string;title:string;provider_name:string|null;practitioner_type:string|null;appointment_type:string|null;location:string|null;starts_at:string;ends_at:string|null;notes:string|null;status:'scheduled'|'completed'|'cancelled';reminder_at:string|null;reminder_sound:string;attendance_confirmed_at:string|null;created_at:string;updated_at:string }; Insert: never; Update: never; Relationships: [] };
      activity_logs: { Row: { id:string;user_id:string;activity_type:string;started_at:string;duration_minutes:number|null;distance_km:number|null;steps:number|null;notes:string|null;source:'manual'|'apple_health'|'health_connect';status:'scheduled'|'completed'|'skipped';completed_at:string|null;series_id:string|null;recurrence:'none'|'daily'|'weekly';created_at:string;updated_at:string }; Insert: never; Update: never; Relationships: [] };
      sleep_logs: { Row: { id:string;user_id:string;sleep_start:string;wake_time:string;quality:number|null;notes:string|null;source:'manual'|'apple_health'|'health_connect';created_at:string;updated_at:string }; Insert: never; Update: never; Relationships: [] };
      notifications: { Row: { id:string;user_id:string;type:'medication'|'appointment'|'refill'|'activity'|'general'|'critical';title:string;body:string;appointment_id:string|null;medication_log_id:string|null;read_at:string|null;created_at:string }; Insert: never; Update: never; Relationships: [] };
      medication_refills: { Row: { id:string;medication_id:string;user_id:string;quantity_received:number;refilled_at:string;created_at:string }; Insert: never; Update: never; Relationships: [] };
      conversations: { Row: { id:string;user_id:string;title:string|null;archived_at:string|null;created_at:string;updated_at:string }; Insert: never; Update: never; Relationships: [] };
      conversation_messages: { Row: { id:string;conversation_id:string;role:'user'|'assistant'|'system';content:string;created_at:string }; Insert: never; Update: never; Relationships: [] };
      symptom_assessments: { Row: { id:string;user_id:string;symptoms:Json;urgency:'emergency'|'urgent'|'routine'|'self_care';summary:string;possible_considerations:Json;red_flags:Json;next_step:string;disclaimer:string;created_at:string }; Insert: never; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      record_consent: {
        Args: { p_consent_type: ConsentType; p_granted: boolean };
        Returns: Database['public']['Tables']['consents']['Row'];
      };
      create_medication: { Args: Record<string, unknown>; Returns: Json };
      update_medication: { Args: Record<string, unknown>; Returns: Json };
      archive_medication: { Args: { p_medication_id: string }; Returns: Json };
      ensure_medication_logs_for_date: { Args: { p_date: string }; Returns: number };
      refresh_missed_medication_logs: { Args: Record<string, never>; Returns: number };
      get_medications_for_date: { Args: { p_date: string }; Returns: Json };
      get_medication_details: { Args: { p_medication_id: string }; Returns: Json };
      record_medication_status: { Args: { p_log_id: string; p_status: string }; Returns: Json };
      get_medication_history: { Args: { p_from: string; p_to: string; p_medication_id?: string | null }; Returns: Json };
      get_active_medications: { Args: Record<string, never>; Returns: Json };
      get_appointments: { Args: { p_from:string;p_to:string }; Returns: Database['public']['Tables']['appointments']['Row'][] };
      get_appointment_details: { Args: { p_id:string }; Returns: Database['public']['Tables']['appointments']['Row'] };
      save_appointment: { Args: { p_id:string|null;p_title:string;p_provider_name:string|null;p_practitioner_type:string|null;p_appointment_type:string|null;p_location:string|null;p_starts_at:string;p_ends_at:string|null;p_notes:string|null;p_reminder_at:string|null;p_reminder_sound:string }; Returns: Database['public']['Tables']['appointments']['Row'] };
      set_appointment_status: { Args: { p_id:string;p_status:string }; Returns: Database['public']['Tables']['appointments']['Row'] };
      confirm_appointment_attendance: { Args: { p_id:string }; Returns: Database['public']['Tables']['appointments']['Row'] };
      create_activity: { Args: { p_activity_type:string;p_started_at:string;p_duration_minutes:number|null;p_distance_km:number|null;p_steps:number|null;p_notes:string|null }; Returns: Database['public']['Tables']['activity_logs']['Row'] };
      save_activity: { Args: { p_id:string|null;p_activity_type:string;p_started_at:string;p_duration_minutes:number|null;p_distance_km:number|null;p_steps:number|null;p_notes:string|null;p_recurrence:string;p_recurrence_until:string|null }; Returns: Database['public']['Tables']['activity_logs']['Row'] };
      set_activity_status: { Args: { p_id:string;p_status:string }; Returns: Database['public']['Tables']['activity_logs']['Row'] };
      get_activity_details: { Args: { p_id:string }; Returns: Database['public']['Tables']['activity_logs']['Row'] };
      get_activity_adherence: { Args: { p_from:string;p_to:string }; Returns:Json };
      get_home_dashboard: { Args: { p_day_start:string;p_day_end:string;p_now:string }; Returns:Json };
      create_sleep_log: { Args: { p_sleep_start:string;p_wake_time:string;p_quality:number|null;p_notes:string|null }; Returns: Database['public']['Tables']['sleep_logs']['Row'] };
      mark_notification_read: { Args: { p_id:string }; Returns: Database['public']['Tables']['notifications']['Row'] };
      mark_all_notifications_read: { Args: Record<string,never>; Returns:number };
      mark_medication_refilled: { Args: { p_medication_id:string;p_quantity:number;p_refilled_at:string }; Returns:Json };
      configure_medication_supply: { Args: { p_medication_id:string;p_supply_quantity:number|null;p_units_per_dose:number|null;p_supply_unit:string|null;p_refill_warning_days:number|null }; Returns:Json };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
