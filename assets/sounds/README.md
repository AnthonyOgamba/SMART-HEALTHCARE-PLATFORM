# Medication notification sounds

Custom medication sounds are optional. Add valid WAV files using these exact names:

- `medication_gentle_chime.wav`
- `medication_soft_bell.wav`
- `medication_bright_alert.wav`
- `medication_calm_tone.wav`
- `medication_classic_reminder.wav`

`app.config.js` includes files that exist in the `expo-notifications` config plugin and exposes their filenames to the runtime. Missing files safely use the platform default sound. Custom sounds require a development or production build; Expo Go uses the default sound.
