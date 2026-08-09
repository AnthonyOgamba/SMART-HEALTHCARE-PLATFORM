import { useMemo } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconBadge } from '@/components/ui/icon-badge';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import type { AppNotification, MetricColorKey, NotificationType } from '@/types';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const TYPE_META: Record<NotificationType, { icon: MaterialIconName; colorKey: MetricColorKey }> = {
  medication: { icon: 'medication', colorKey: 'blue' },
  tip: { icon: 'bolt', colorKey: 'green' },
  appointment: { icon: 'person', colorKey: 'gray' },
  sleep: { icon: 'nightlight-round', colorKey: 'blue' },
};

export interface NotificationCardProps {
  notification: AppNotification;
  /** Labels for the action buttons, in order. First is styled as primary. */
  actions?: string[];
  onActionPress?: (action: string) => void;
}

export function NotificationCard({ notification, actions, onActionPress }: NotificationCardProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const meta = TYPE_META[notification.type];
  const isTip = notification.type === 'tip';

  return (
    <SurfaceCard style={isTip ? { backgroundColor: theme.tipBg, borderColor: theme.tipBorder } : undefined}>
      <View style={styles.row}>
        <IconBadge
          icon={meta.icon}
          color={theme[`${meta.colorKey}Icon`]}
          backgroundColor={theme[`${meta.colorKey}Tint`]}
          size={36}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.headerRow}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {notification.title}
            </ThemedText>
            <ThemedText style={styles.time}>{notification.timeLabel}</ThemedText>
          </View>
          <ThemedText style={styles.body}>{notification.body}</ThemedText>

          {actions && actions.length > 0 ? (
            <View style={styles.actionRow}>
              {actions.map((action, index) => (
                <Pressable
                  key={action}
                  accessibilityRole="button"
                  onPress={() => onActionPress?.(action)}
                  style={[styles.actionButton, index === 0 ? styles.actionPrimary : null]}>
                  <ThemedText style={index === 0 ? styles.actionPrimaryText : styles.actionSecondaryText}>
                    {action}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </SurfaceCard>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    title: {
      fontSize: 14,
      flexShrink: 1,
      color: theme.textPrimary,
    },
    time: {
      fontSize: 11,
      color: theme.textMuted,
    },
    body: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    actionRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
      flexWrap: 'wrap',
    },
    actionButton: {
      borderRadius: Radius.pill,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    actionPrimary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    actionPrimaryText: {
      color: theme.white,
      fontSize: 12,
      fontWeight: '600',
    },
    actionSecondaryText: {
      color: theme.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
  });
