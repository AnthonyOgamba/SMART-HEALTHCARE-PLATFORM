import { useMemo } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconBadge } from '@/components/ui/icon-badge';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface NavRowProps {
  icon: MaterialIconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

/** Tappable row with icon, title/subtitle and a chevron — used in Settings. */
export function NavRow({ icon, iconColor, iconBackground, title, subtitle, onPress }: NavRowProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <IconBadge icon={icon} color={iconColor} backgroundColor={iconBackground} size={30} />
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={theme.iconMuted} />
    </Pressable>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    title: {
      fontSize: 15,
      color: theme.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });
