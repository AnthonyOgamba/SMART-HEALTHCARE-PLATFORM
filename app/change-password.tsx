import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScreenContainer } from '@/components/ui/screen-states';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { updatePassword } from '@/lib/services/auth';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmation) { setError('Passwords do not match.'); return; }
    setSaving(true); setError(undefined);
    try {
      await updatePassword(password);
      setPassword(''); setConfirmation('');
      Alert.alert('Password Updated', 'Your account password was updated.', [{ text: 'Done', onPress: () => router.back() }]);
    } catch { setError('Could not update your password. Please try again.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer style={styles.content}>
    <View style={styles.header}><Pressable accessibilityLabel="Go back" onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={theme.primary} /></Pressable><ThemedText style={styles.title}>Change Password</ThemedText></View>
    <ThemedText style={styles.copy}>Choose a strong new password for your Supabase-authenticated account.</ThemedText>
    <Input label="New Password" icon="lock-outline" value={password} onChangeText={setPassword} secureTextEntry={!visible} error={error} rightIcon={visible ? 'visibility-off' : 'visibility'} onRightIconPress={() => setVisible(value => !value)} />
    <Input label="Confirm New Password" icon="lock-outline" value={confirmation} onChangeText={setConfirmation} secureTextEntry={!visible} />
    <Button label="Update Password" onPress={save} loading={saving} />
  </ScreenContainer>;
}
const makeStyles = (theme: ThemePalette) => StyleSheet.create({ content: { backgroundColor: theme.screenBg, gap: Spacing.md }, header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { color: theme.primary, fontSize: 24, fontWeight: '700' }, copy: { color: theme.textSecondary, fontSize: 14 } });
