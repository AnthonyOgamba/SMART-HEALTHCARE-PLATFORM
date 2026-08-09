import { useMemo } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { IconBadge } from '@/components/ui/icon-badge';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface ToggleRowProps {
  icon: MaterialIconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Icon + title/description + switch row — used in Settings and Consent Management. */
export function ToggleRow({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  value,
  onValueChange,
}: ToggleRowProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <IconBadge icon={icon} color={iconColor} backgroundColor={iconBackground} size={36} />
      <View style={styles.textCol}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.primary }} />
    </View>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.sm,
    },
    textCol: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 15,
      color: theme.textPrimary,
    },
    description: {
      fontSize: 13,
      color: theme.textSecondary,
    },
  });
