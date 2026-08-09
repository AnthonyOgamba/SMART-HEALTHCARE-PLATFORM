import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export interface AuthFooterLinkProps {
  prompt: string;
  linkLabel: string;
  onPress: () => void;
}

/** "Already have an account? Login" style footer used on every auth screen. */
export function AuthFooterLink({ prompt, linkLabel, onPress }: AuthFooterLinkProps) {
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <ThemedText style={styles.prompt}>{prompt} </ThemedText>
      <Pressable accessibilityRole="link" accessibilityLabel={linkLabel} onPress={onPress}>
        <ThemedText style={styles.link}>{linkLabel}</ThemedText>
      </Pressable>
    </View>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    prompt: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    link: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.accent,
    },
  });
