import { supabase } from '@/lib/supabase/client';
import type { ActivityLog } from '@/types';

export const ACTIVITY_TYPES=['Walking','Running','Cycling','Gym / Strength','Stretching','Swimming','Other'] as const;
export type ActivityRecurrence='none'|'daily'|'weekly';

const map=(x:any):ActivityLog=>({id:x.id,activityType:x.activity_type,startedAt:x.started_at,durationMinutes:x.duration_minutes,distanceKm:x.distance_km===null?null:Number(x.distance_km),steps:x.steps,notes:x.notes,source:x.source,status:x.status??'completed',completedAt:x.completed_at??null,seriesId:x.series_id??null,recurrence:x.recurrence??'none'});
export type ActivityInput={activityType:string;startedAt:string;durationMinutes:number|null;distanceKm:number|null;steps:number|null;notes:string;recurrence:ActivityRecurrence;recurrenceUntil:string|null};

export async function saveActivity(input:ActivityInput,id?:string){const{data,error}=await(supabase.rpc as any)('save_activity',{p_id:id??null,p_activity_type:input.activityType,p_started_at:input.startedAt,p_duration_minutes:input.durationMinutes,p_distance_km:input.distanceKm,p_steps:input.steps,p_notes:input.notes,p_recurrence:input.recurrence,p_recurrence_until:input.recurrenceUntil});if(error)throw error;return map(data);}
export async function getActivityDetails(id:string){const{data,error}=await(supabase.rpc as any)('get_activity_details',{p_id:id});if(error)throw error;if(!data)throw new Error('Activity not found');return map(data);}
export async function setActivityStatus(id:string,status:'completed'|'skipped'){const{data,error}=await(supabase.rpc as any)('set_activity_status',{p_id:id,p_status:status});if(error)throw error;return map(data);}
export async function getActivities(from:string,to:string){const{data,error}=await supabase.from('activity_logs' as any).select('*').gte('started_at',from).lt('started_at',to).order('started_at');if(error)throw error;return(data??[]).map(map);}
export async function getActivityAdherence(from:string,to:string){const{data,error}=await(supabase.rpc as any)('get_activity_adherence',{p_from:from,p_to:to});if(error)throw error;return data as{due:number;completed:number;percentage:number|null};}
export function activityProgress(total:number,goal:number|null){return goal?Math.min(total/goal,1)*100:null;}
