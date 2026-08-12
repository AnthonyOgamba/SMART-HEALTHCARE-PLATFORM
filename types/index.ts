/**
 * Shared domain types for HealthNexus.
 * Mirrors the API contract / data model in Section 8 of the evaluation report
 * (FHIR-based resources on the backend, simplified for frontend consumption).
 *
 * NOTE: Confirm exact field names/shapes with Member 4 (backend) once the
 * real endpoints are live — these are based on the planned API contract table.
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  consents: ConsentSummary;
}

export interface ConsentSummary {
  assistantEnabled: boolean;
  wearableEnabled: boolean;
  analyticsEnabled: boolean;
  updatedAt: string;
}

export type MedicationStatus = 'taken' | 'skipped' | 'missed' | 'pending';

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dose: string;
  instructions: string | null;
  startDate: string;
  endDate: string | null;
  reminderSound: import('@/lib/notification-sounds').MedicationReminderSound;
  active: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  timeOfDay: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduleId: string | null;
  scheduledFor: string;
  status: MedicationStatus;
  recordedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAdherenceSummary {
  scheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  pending: number;
  percentage: number;
}

export interface MedicationForDay {
  medication: Medication;
  schedule: MedicationSchedule | null;
  log: MedicationLog;
}

export interface MedicationDay {
  date: string;
  summary: Omit<MedicationAdherenceSummary, 'percentage'>;
  items: MedicationForDay[];
}

export interface MedicationDetails {
  medication: Medication;
  schedules: MedicationSchedule[];
  nextLog: MedicationLog | null;
  adherence: MedicationAdherenceSummary;
}

export interface MedicationHistoryEntry {
  id: string;
  medicationId: string;
  medicationName: string;
  dose: string;
  scheduledFor: string;
  status: MedicationStatus;
  recordedAt: string | null;
}

export interface MedicationHistory {
  entries: MedicationHistoryEntry[];
  summary: MedicationAdherenceSummary;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  title: string;
  provider?: string;
  location?: string;
  startTime: string;
  endTime?: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface SymptomJournalEntry {
  id: string;
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  startedAt: string;
  notes?: string;
}

export type AssistantRole = 'user' | 'assistant' | 'system';

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: string;
  isEmergencyEscalation?: boolean;
}

export interface DashboardSummary {
  upcomingAppointment?: Appointment;
  medicationAdherence: number; // 0-1
  recentObservations: WellnessObservation[];
  alerts: WellnessAlert[];
}

export interface WellnessObservation {
  id: string;
  type: 'steps' | 'heartRate' | 'sleep' | 'weight' | string;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface WellnessAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export type MetricColorKey = 'red' | 'blue' | 'green' | 'amber' | 'gray';

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: 'favorite' | 'nightlight-round' | 'bolt';
  colorKey: MetricColorKey;
}

export type NotificationType = 'medication' | 'tip' | 'appointment' | 'sleep';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timeLabel: string;
  group: 'Today' | 'Upcoming' | 'Yesterday';
  actionable?: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface HealthInfo {
  bloodType: string;
  allergies: string;
  chronicConditions: string;
}

export interface ProfileDetails {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: EmergencyContact;
  healthInfo: HealthInfo;
}

// Generic API envelope
export interface ApiError {
  status: number;
  message: string;
}
