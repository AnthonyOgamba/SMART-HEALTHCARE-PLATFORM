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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
