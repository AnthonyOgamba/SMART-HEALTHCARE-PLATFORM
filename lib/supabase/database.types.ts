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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          medication_reminders?: boolean;
          appointment_reminders?: boolean;
          critical_alerts?: boolean;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          medication_reminders?: boolean;
          appointment_reminders?: boolean;
          critical_alerts?: boolean;
          ai_enabled?: boolean;
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
