import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

type QuickAddKind = 'medication' | 'appointment' | 'activity' | 'sleep';
export function QuickAddSheet({visible,onClose,onSelect,includeSleep=true}:{visible:boolean;onClose:()=>void;onSelect:(value:QuickAddKind)=>void;includeSleep?:boolean}){
 const theme=usePalette();
 if(!visible)return null;
 const items:[QuickAddKind,string][]=[['medication','Add Medication'],['appointment','Add Appointment'],['activity','Log Exercise']];if(includeSleep)items.push(['sleep','Log Sleep']);
 const choose=(kind:QuickAddKind)=>{onClose();requestAnimationFrame(()=>onSelect(kind))};
 return <Modal transparent visible animationType="slide" onRequestClose={onClose}><View style={styles.modalRoot}><Pressable accessibilityLabel="Close add menu" style={styles.backdrop} onPress={onClose}/><View style={[styles.sheet,{backgroundColor:theme.cardBg}]}>{items.length?<Text style={[styles.title,{color:theme.textPrimary}]}>Add to Care Schedule</Text>:null}{items.map(([kind,label])=><Pressable accessibilityRole="button" key={kind} style={[styles.action,{backgroundColor:theme.selectedBackground}]} onPress={()=>choose(kind)}><Text style={[styles.text,{color:theme.primary}]}>{label}</Text></Pressable>)}<Pressable style={styles.cancel} onPress={onClose}><Text style={{color:theme.textPrimary}}>Cancel</Text></Pressable></View></View></Modal>
}
const styles=StyleSheet.create({modalRoot:{flex:1,justifyContent:'flex-end'},backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.35)'},sheet:{padding:Spacing.lg,gap:Spacing.sm,borderTopLeftRadius:20,borderTopRightRadius:20},title:{fontSize:18,fontWeight:'700',marginBottom:8},action:{padding:15,borderRadius:12},text:{fontWeight:'700'},cancel:{padding:14,alignItems:'center'}});
