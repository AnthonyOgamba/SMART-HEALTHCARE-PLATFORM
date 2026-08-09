import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { NotificationCard } from '@/components/ui/notification-card';
import { EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { mockDelay, mockNotifications } from '@/lib/api/mock';
import type { AppNotification } from '@/types';

async function loadNotifications(): Promise<AppNotification[]> {
  // TODO: swap for `api.get<AppNotification[]>('/notifications')`
  return mockDelay(mockNotifications);
}

/** Action button labels per notification type. First label renders as primary. */
function actionsFor(notification: AppNotification): string[] | undefined {
  if (!notification.actionable) return undefined;
  if (notification.type === 'medication') return ['Taken', 'Snooze'];
  if (notification.type === 'appointment') return ['Confirm Attendance'];
  return undefined;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    loadNotifications()
      .then(setNotifications)
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingState label="Loading notifications…" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!notifications || notifications.length === 0) {
    return <EmptyState message="You're all caught up." />;
  }

  const groups: AppNotification['group'][] = ['Today', 'Upcoming', 'Yesterday'];

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={8}>
            <MaterialIcons name="arrow-back" size={22} color={theme.iconDefault} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Notifications
          </ThemedText>
        </View>
        <Pressable accessibilityRole="button">
          <ThemedText style={styles.markAllRead}>Mark all as read</ThemedText>
        </Pressable>
      </View>

      {groups.map((group) => {
        const items = notifications.filter((n) => n.group === group);
        if (items.length === 0) return null;
        return (
          <View key={group} style={{ gap: Spacing.sm }}>
            <SectionHeader label={group.toUpperCase()} />
            {items.map((item) => (
              <NotificationCard
                key={item.id}
                notification={item}
                actions={actionsFor(item)}
                onActionPress={() => {
                  // TODO: wire to Member 4's notification action endpoints.
                }}
              />
            ))}
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.md,
      gap: Spacing.lg,
      backgroundColor: theme.screenBg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    headerTitle: {
      fontSize: 20,
      color: theme.accent,
    },
    markAllRead: {
      fontSize: 13,
      color: theme.accent,
      fontWeight: '600',
    },
  });
