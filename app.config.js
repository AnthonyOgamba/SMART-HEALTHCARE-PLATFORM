const fs = require('node:fs');
const path = require('node:path');

const appJson = require('./app.json');

const customSoundFiles = [
  'medication_gentle_chime.wav',
  'medication_soft_bell.wav',
  'medication_bright_alert.wav',
  'medication_calm_tone.wav',
  'medication_classic_reminder.wav',
];

module.exports = ({ config }) => {
  const availableSounds = customSoundFiles.filter((filename) =>
    fs.existsSync(path.join(__dirname, 'assets', 'sounds', filename)),
  );
  const plugins = (appJson.expo.plugins ?? []).map((plugin) =>
    plugin === 'expo-notifications'
      ? ['expo-notifications', {
          sounds: availableSounds.map((filename) => `./assets/sounds/${filename}`),
        }]
      : plugin,
  );

  return {
    ...config,
    ...appJson.expo,
    plugins,
    extra: {
      ...(appJson.expo.extra ?? {}),
      bundledMedicationReminderSounds: availableSounds,
    },
  };
};
