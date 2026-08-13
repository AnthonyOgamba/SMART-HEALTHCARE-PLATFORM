import { supabase } from '@/lib/supabase/client';
import type { CareAppointment } from '@/types';
import type { MedicationReminderSound } from '@/lib/notification-sounds';
export const PRACTITIONER_TYPES=['Doctor','Nurse','Dentist','Physiotherapist','Pharmacist','Specialist','Therapist','Counsellor','Dietitian','Other healthcare practitioner'] as const;
export interface AppointmentInput{title:string;providerName?:string;practitionerType?:string;appointmentType?:string;location?:string;startsAt:string;endsAt?:string|null;notes?:string;reminderAt?:string|null;reminderSound:MedicationReminderSound}
type Raw=Record<string,any>;
export const mapAppointment=(x:Raw):CareAppointment=>({id:x.id,title:x.title,providerName:x.provider_name,practitionerType:x.practitioner_type,appointmentType:x.appointment_type,location:x.location,startsAt:x.starts_at,endsAt:x.ends_at,notes:x.notes,status:x.status,reminderAt:x.reminder_at,reminderSound:x.reminder_sound,attendanceConfirmedAt:x.attendance_confirmed_at});
async function rpc<T>(name:string,args:Record<string,unknown>){const {data,error}=await (supabase.rpc as any)(name,args);if(error)throw error;return data as T;}
export async function saveAppointment(input:AppointmentInput,id?:string){return mapAppointment(await rpc<Raw>('save_appointment',{p_id:id??null,p_title:input.title,p_provider_name:input.providerName??null,p_practitioner_type:input.practitionerType??null,p_appointment_type:input.appointmentType??null,p_location:input.location??null,p_starts_at:input.startsAt,p_ends_at:input.endsAt??null,p_notes:input.notes??null,p_reminder_at:input.reminderAt??null,p_reminder_sound:input.reminderSound}));}
export async function getAppointments(from:string,to:string){const rows=await rpc<Raw[]>('get_appointments',{p_from:from,p_to:to});return rows.map(mapAppointment);}
export async function getUpcomingAppointments(){return getAppointments(new Date().toISOString(),new Date(Date.now()+31536000000).toISOString());}
export async function getAppointmentDetails(id:string){return mapAppointment(await rpc<Raw>('get_appointment_details',{p_id:id}));}
export async function cancelAppointment(id:string){return mapAppointment(await rpc<Raw>('set_appointment_status',{p_id:id,p_status:'cancelled'}));}
export async function completeAppointment(id:string){return mapAppointment(await rpc<Raw>('set_appointment_status',{p_id:id,p_status:'completed'}));}
export async function confirmAppointmentAttendance(id:string){return mapAppointment(await rpc<Raw>('confirm_appointment_attendance',{p_id:id}));}
