/**
 * Mock data for building screens before Member 4's endpoints are live.
 * Swap the `USE_MOCK` flag off once real endpoints exist, or replace
 * individual functions in your screens with real `api.get(...)` calls.
 */
import type {
  DashboardSummary,
  HealthMetric,
  ProfileDetails,
} from '@/types';

export const USE_MOCK = true;

export const mockDashboard: DashboardSummary = {
  medicationAdherence: 0.82,
  recentObservations: [
  ],
  alerts: [
    { id: 'alert-1', message: 'You missed your evening dose yesterday.', severity: 'warning', createdAt: '2026-08-07T21:00:00Z' },
  ],
};

export const mockHealthMetrics: HealthMetric[] = [
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
