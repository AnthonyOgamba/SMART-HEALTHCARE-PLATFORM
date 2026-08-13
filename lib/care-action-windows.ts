export const APPOINTMENT_CHECK_IN_BEFORE_MS = 30 * 60 * 1000;
export const APPOINTMENT_CHECK_IN_AFTER_MS = 4 * 60 * 60 * 1000;
export const MEDICATION_EARLY_ACTION_MS = 15 * 60 * 1000;

export function canConfirmMedication(scheduledFor: string, now = new Date()) {
  return new Date(scheduledFor).getTime() <= now.getTime() + MEDICATION_EARLY_ACTION_MS;
}
export function canConfirmAppointment(startsAt: string, now = new Date()) {
  const offset = now.getTime() - new Date(startsAt).getTime();
  return offset >= -APPOINTMENT_CHECK_IN_BEFORE_MS && offset <= APPOINTMENT_CHECK_IN_AFTER_MS;
}
export function canConfirmActivity(startsAt: string, now = new Date()) {
  return new Date(startsAt).getTime() <= now.getTime();
}

export function getCareScheduleActions(item:CareScheduleItem,now=new Date()):CareScheduleAction[]{
  if(item.kind==='medication'&&item.status==='pending'&&item.actionId&&canConfirmMedication(item.startsAt,now))return[
    {type:'medication_taken',label:'Taken',primary:true},{type:'medication_skip',label:'Skip'},
  ];
  if(item.kind==='activity'&&item.status==='scheduled'&&item.actionId&&canConfirmActivity(item.startsAt,now))return[
    {type:'activity_complete',label:'Complete',primary:true},{type:'activity_skip',label:'Skip'},
  ];
  if(item.kind==='appointment'&&item.status==='scheduled'&&item.actionId&&canConfirmAppointment(item.startsAt,now))return[
    ...(!item.attendanceConfirmedAt?[{type:'appointment_checkin' as const,label:"I'm Here",primary:true}]:[]),
    {type:'appointment_complete',label:'Mark Completed',primary:Boolean(item.attendanceConfirmedAt)},
  ];
  return[];
}
import type { CareScheduleAction, CareScheduleItem } from '@/types';
