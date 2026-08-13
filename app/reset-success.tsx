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
      title="Check Your Email"
      subtitle="If an account exists for that email, a password reset link has been sent. Open the link on this device to choose a new password."
      style={styles.card}>
      <View style={styles.checkCircle}>
        <MaterialIcons name="check" size={28} color={theme.white} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.statusText}>
        Check Your Email
      </ThemedText>

      <View style={styles.buttonWrap}>
        <Button
          label="Back to Login"
          icon="arrow-forward"
          onPress={() => router.replace('/login')}
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
