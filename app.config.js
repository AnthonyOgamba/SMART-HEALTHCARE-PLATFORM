const fs = require('node:fs');
const path = require('node:path');

const appJson = require('./app.json');

const customSoundFiles = [
  'alarm-clock-digital-beeping.wav',
  'air-raid-siren-wailing-urgent.wav',
];

module.exports = ({ config }) => {
  const availableSounds = customSoundFiles.filter((filename) =>
    fs.existsSync(path.join(__dirname, 'assets', 'sounds', filename)),
  );
  const plugins = (appJson.expo.plugins ?? []).map((plugin) =>
    (plugin === 'expo-notifications' || (Array.isArray(plugin) && plugin[0] === 'expo-notifications'))
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
