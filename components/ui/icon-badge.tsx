import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface IconBadgeProps {
  icon: MaterialIconName;
  color: string;
  backgroundColor: string;
  size?: number;
}

/** Small colored circle with an icon — used across Dashboard, Notifications, Profile. */
export function IconBadge({ icon, color, backgroundColor, size = 40 }: IconBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor, width: size, height: size, borderRadius: size / 2 },
      ]}>
      <MaterialIcons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
