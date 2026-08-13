import { supabase } from '@/lib/supabase/client';
import type { SleepLog } from '@/types';
const map=(x:any):SleepLog=>({id:x.id,sleepStart:x.sleep_start,wakeTime:x.wake_time,quality:x.quality,notes:x.notes,source:x.source});
export async function createSleepLog(input:{sleepStart:string;wakeTime:string;quality:number|null;notes:string}){const{data,error}=await(supabase.rpc as any)('create_sleep_log',{p_sleep_start:input.sleepStart,p_wake_time:input.wakeTime,p_quality:input.quality,p_notes:input.notes});if(error)throw error;return map(data);}
export async function getSleepLogs(from:string,to:string){const{data,error}=await supabase.from('sleep_logs' as any).select('*').gte('wake_time',from).lt('wake_time',to).order('wake_time');if(error)throw error;return(data??[]).map(map);}
export function sleepDurationMinutes(start:string,wake:string){return Math.max(0,Math.round((new Date(wake).getTime()-new Date(start).getTime())/60000));}
