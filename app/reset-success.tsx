import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export default function ResetSuccessScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <AuthLayout
      title="Success!"
      subtitle="Your password has been reset successfully. You can now log in with your new credentials."
      style={styles.card}>
      <View style={styles.checkCircle}>
        <MaterialIcons name="check" size={28} color={theme.white} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.statusText}>
        Password Updated
      </ThemedText>

      <View style={styles.buttonWrap}>
        <Button
          label="Return to Login"
          icon="arrow-forward"
          onPress={() => router.replace('/')}
        />
      </View>
    </AuthLayout>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    card: {
      alignItems: 'center',
    },
    checkCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xs,
    },
    statusText: {
      fontSize: 16,
      marginBottom: Spacing.xs,
    },
    buttonWrap: {
      width: '100%',
      marginTop: Spacing.sm,
    },
  });
