import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WELCOME_BLUE = '#0757AC';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const artworkHeight = width * (1674 / 942);
  const visibleArtworkHeight = artworkHeight * 0.66;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={[styles.artworkWindow, { height: visibleArtworkHeight }]}>
        <Image
          source={require('@/assets/images/brand/welcome-screen-buttonless.png')}
          style={[styles.artwork, { height: artworkHeight }]}
          contentFit="contain"
          contentPosition="top center"
          accessibilityLabel="Genie Cares smart healthcare service"
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log in"
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.button, styles.loginButton, pressed && styles.pressed]}>
          <Text style={styles.loginText}>Log In</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create account"
          onPress={() => router.push('/signup')}
          style={({ pressed }) => [styles.button, styles.signupButton, pressed && styles.pressed]}>
          <Text style={styles.signupText}>Sign In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 84,
  },
  artworkWindow: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
  },
  artwork: {
    width: '100%',
  },
  actions: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 10,
    gap: 12,
    alignSelf: 'center',
    maxWidth: 480,
  },
  button: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  loginButton: {
    backgroundColor: WELCOME_BLUE,
    borderColor: WELCOME_BLUE,
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderColor: WELCOME_BLUE,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  signupText: {
    color: WELCOME_BLUE,
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
