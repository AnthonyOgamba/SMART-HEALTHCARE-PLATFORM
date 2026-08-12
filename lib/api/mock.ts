/**
 * Mock data for building screens before Member 4's endpoints are live.
 * Swap the `USE_MOCK` flag off once real endpoints exist, or replace
 * individual functions in your screens with real `api.get(...)` calls.
 */
import type {
  Appointment,
  AppNotification,
  DashboardSummary,
  HealthMetric,
  ProfileDetails,
} from '@/types';

export const USE_MOCK = true;

export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    title: 'Annual Checkup',
    provider: 'Dr. Chen',
    location: 'Riverside Clinic',
    startTime: '2026-08-12T14:00:00Z',
    status: 'scheduled',
  },
  {
    id: 'appt-2',
    title: 'Follow-up',
    provider: 'Dr. Patel',
    startTime: '2026-08-20T10:30:00Z',
    status: 'scheduled',
  },
];

export const mockDashboard: DashboardSummary = {
  upcomingAppointment: mockAppointments[0],
  medicationAdherence: 0.82,
  recentObservations: [
    { id: 'obs-1', type: 'steps', value: 6421, unit: 'steps', recordedAt: '2026-08-08T07:00:00Z' },
    { id: 'obs-2', type: 'sleep', value: 7.2, unit: 'hrs', recordedAt: '2026-08-08T06:00:00Z' },
  ],
  alerts: [
    { id: 'alert-1', message: 'You missed your evening dose yesterday.', severity: 'warning', createdAt: '2026-08-07T21:00:00Z' },
  ],
};

export const mockHealthMetrics: HealthMetric[] = [
  { id: 'hr', label: 'Heart Rate', value: '72', unit: 'BPM', icon: 'favorite', colorKey: 'red' },
  { id: 'sleep', label: 'Sleep', value: '7h 45m', unit: '', icon: 'nightlight-round', colorKey: 'blue' },
  { id: 'activity', label: 'Activity', value: '8,432', unit: 'steps', icon: 'bolt', colorKey: 'green' },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'medication',
    title: 'Medication Reminder',
    body: "It's time to take your Vitamin D. Consistent intake helps maintain bone health.",
    timeLabel: '8:00 AM',
    group: 'Today',
    actionable: true,
  },
  {
    id: 'n2',
    type: 'tip',
    title: 'Health Tip',
    body: "Great start! You've already reached 3,000 steps. Keep it up to hit your daily goal.",
    timeLabel: '9:30 AM',
    group: 'Today',
  },
  {
    id: 'n3',
    type: 'appointment',
    title: 'Appointment is near',
    body: "Don't forget your appointment with Dr. Sarah Ahmed.",
    timeLabel: 'Just now',
    group: 'Upcoming',
    actionable: true,
  },
  {
    id: 'n4',
    type: 'sleep',
    title: 'Sleep Report Ready',
    body: 'Your sleep summary for last night is available. You slept 7h 45m.',
    timeLabel: 'Yesterday',
    group: 'Yesterday',
  },
];

export const mockProfile: ProfileDetails = {
  fullName: 'Emma Health',
  email: 'emma.health@example.com',
  phone: '+1 234 567 890',
  emergencyContact: {
    name: 'John Doe',
    relationship: 'Brother',
    phone: '+1 987 654 321',
  },
  healthInfo: {
    bloodType: 'A+',
    allergies: 'Peanuts',
    chronicConditions: 'None',
  },
};

// Simulates network latency so loading states are actually visible during dev.
export function mockDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
