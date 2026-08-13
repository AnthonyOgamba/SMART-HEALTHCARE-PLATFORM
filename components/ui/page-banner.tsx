import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

export function PageBanner({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  const theme=usePalette();
  return <View style={[styles.banner,{backgroundColor:theme.bannerBackground}]}><View style={styles.icon}><MaterialIcons name={icon} size={30} color="#FFFFFF" /></View><View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View></View>;
}

const styles=StyleSheet.create({banner:{flexDirection:'row',alignItems:'center',gap:Spacing.md,borderRadius:Radius.lg,padding:Spacing.lg},icon:{width:54,height:54,borderRadius:27,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,0.14)'},copy:{flex:1,gap:Spacing.xs},title:{color:'#FFFFFF',fontSize:20,fontWeight:'700'},description:{color:'rgba(255,255,255,0.86)',fontSize:13,lineHeight:19}});
