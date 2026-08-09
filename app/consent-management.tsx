import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { ToggleRow } from '@/components/ui/toggle-row';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export default function ConsentManagementScreen() {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [healthDataSharing, setHealthDataSharing] = useState(true);
  const [aiAssistantUsage, setAiAssistantUsage] = useState(true);
  const [notificationPermissions, setNotificationPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: swap for `api.patch('/consent', { healthDataSharing, aiAssistantUsage, notificationPermissions })`
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ThemedText type="title" style={styles.headerTitle}>
          Consent Management
        </ThemedText>
        <MaterialIcons name="notifications-none" size={22} color={theme.iconDefault} />
      </View>

      <ThemedText style={styles.subtitle}>
        Control how your data is used within HealthNexus. You can update these preferences at
        any time.
      </ThemedText>

      <SurfaceCard>
        <ToggleRow
          icon="folder-shared"
          iconColor={theme.greenIcon}
          iconBackground={theme.greenTint}
          title="Health Data Sharing"
          description="Allow sharing of health data with clinical partners for better care and integrated diagnostics."
          value={healthDataSharing}
          onValueChange={setHealthDataSharing}
        />
        <View style={styles.divider} />
        <ToggleRow
          icon="smart-toy"
          iconColor={theme.accent}
          iconBackground={theme.blueTint}
          title="AI Assistant Usage"
          description="Enable AI analysis of your activity patterns to provide personalized health insights and recommendations."
          value={aiAssistantUsage}
          onValueChange={setAiAssistantUsage}
        />
        <View style={styles.divider} />
        <ToggleRow
          icon="notifications"
          iconColor={theme.blueIcon}
          iconBackground={theme.blueTint}
          title="Notification Permissions"
          description="Receive alerts for medication reminders, appointment updates, and critical health changes."
          value={notificationPermissions}
          onValueChange={setNotificationPermissions}
        />
      </SurfaceCard>

      <View style={styles.hipaaRow}>
        <MaterialIcons name="info-outline" size={16} color={theme.iconMuted} />
        <ThemedText style={styles.hipaaText}>
          All data is encrypted and stored according to industry-standard HIPAA guidelines.
        </ThemedText>
      </View>

      <Button label="Save Preferences" onPress={handleSave} loading={saving} />
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.md,
      gap: Spacing.md,
      backgroundColor: theme.screenBg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 18,
      color: theme.accent,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    divider: {
      height: 1,
      backgroundColor: theme.cardBorder,
      marginVertical: Spacing.xs,
    },
    hipaaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.xs,
    },
    hipaaText: {
      flex: 1,
      fontSize: 12,
      color: theme.textSecondary,
    },
  });
