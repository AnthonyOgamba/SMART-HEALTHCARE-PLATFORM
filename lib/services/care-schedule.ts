import { getActivities, getActivityAdherence } from './activities';
import { getAppointments } from './appointments';
import { getMedicationsForDate } from './medications';
import { getUserSettings } from './settings';
import { getSleepLogs, sleepDurationMinutes } from './sleep';
import type { ActivityLog, CareAppointment, CareScheduleItem, MedicationDay, SleepLog } from '@/types';

export type CareScheduleSource='medications'|'appointments'|'activity'|'sleep'|'settings';
export interface CareScheduleWarning{source:Exclude<CareScheduleSource,'medications'>;message:string}
export class CareScheduleCoreError extends Error{source:CareScheduleSource;rpc?:string;code?:string;details?:string;constructor(source:CareScheduleSource,cause:unknown){super('Core care schedule data is unavailable.');this.name='CareScheduleCoreError';this.source=source;const value=cause as {rpc?:string;code?:string;message?:string;details?:string};this.rpc=value?.rpc;this.code=value?.code;this.details=value?.details;if(__DEV__)console.debug('[CareSchedule] Core source unavailable',{source,rpc:value?.rpc,code:value?.code,message:value?.message,details:value?.details});}}
function logOptional(source:CareScheduleWarning['source'],cause:unknown){const value=cause as{code?:string;message?:string;details?:string};if(__DEV__)console.debug('[CareSchedule] Optional source unavailable',{source,code:value?.code,message:value?.message,details:value?.details});return{source,message:`${source} data is temporarily unavailable.`};}
export const localDate=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function dayBounds(date:string){const start=new Date(`${date}T00:00:00`),end=new Date(start);end.setDate(end.getDate()+1);if(!Number.isFinite(start.getTime())||start>=end)throw new Error('Invalid local calendar date');return[start.toISOString(),end.toISOString()]as const;}
export function medicationProgress(items:{startsAt:string;status:string}[],now=new Date()){const due=items.filter(item=>new Date(item.startsAt)<=now),taken=due.filter(item=>item.status==='taken').length;return{dueDoseCount:due.length,takenDueCount:taken,percent:due.length?Math.min(100,taken/due.length*100):null,futureDoseCount:items.length-due.length};}
export async function getCareSchedule(date:string){
  const[from,to]=dayBounds(date);
  let meds:MedicationDay;
  try{meds=await getMedicationsForDate(date);}catch(error){throw new CareScheduleCoreError('medications',error);}
  const adherenceFrom=new Date(from);adherenceFrom.setDate(adherenceFrom.getDate()-29);
  const results=await Promise.allSettled([getAppointments(from,to),getActivities(from,to),getSleepLogs(from,to),getUserSettings(),getActivityAdherence(adherenceFrom.toISOString(),to)]as const);
  const warnings:CareScheduleWarning[]=[];
  const optional=<T>(index:number,source:CareScheduleWarning['source'],fallback:T):T=>{const result=results[index];if(result.status==='fulfilled')return result.value as T;warnings.push(logOptional(source,result.reason));return fallback;};
  const appointments=optional<CareAppointment[]>(0,'appointments',[]),activities=optional<ActivityLog[]>(1,'activity',[]),sleep=optional<SleepLog[]>(2,'sleep',[]),settings=optional<Awaited<ReturnType<typeof getUserSettings>>>(3,'settings',null),activityAdherence=optional<{due:number;completed:number;percentage:number|null}>(4,'activity',{due:0,completed:0,percentage:null});
  const items:CareScheduleItem[]=[...meds.items.map(item=>({id:`m-${item.log.id}`,kind:'medication' as const,startsAt:item.log.scheduledFor,title:item.medication.name,subtitle:item.medication.dose,status:item.log.status,resourceId:item.medication.id,actionId:item.log.id})),...appointments.map(item=>({id:`a-${item.id}`,kind:'appointment' as const,startsAt:item.startsAt,title:item.title,subtitle:[item.providerName,item.location].filter(Boolean).join(' • '),status:item.status,resourceId:item.id,actionId:item.id,attendanceConfirmedAt:item.attendanceConfirmedAt})),...activities.map(item=>({id:`x-${item.id}`,kind:'activity' as const,startsAt:item.startedAt,title:item.activityType,subtitle:item.durationMinutes===null?'Scheduled activity':`${item.durationMinutes} minutes`,status:item.status,resourceId:item.id,actionId:item.id})),...sleep.map(item=>({id:`s-${item.id}`,kind:'sleep' as const,startsAt:item.sleepStart,title:'Sleep',subtitle:`${Math.floor(sleepDurationMinutes(item.sleepStart,item.wakeTime)/60)}h ${sleepDurationMinutes(item.sleepStart,item.wakeTime)%60}m`,status:'recorded',resourceId:item.id}))];
  return{items:items.sort((a,b)=>a.startsAt.localeCompare(b.startsAt)),medications:meds,appointments,activities,sleep,activityGoalMinutes:settings?.daily_activity_goal_minutes??null,totalActivityMinutes:activities.filter(item=>item.status==='completed').reduce((sum,item)=>sum+(item.durationMinutes??0),0),activityAdherence,warnings};
}
