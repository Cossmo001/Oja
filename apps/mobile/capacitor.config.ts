import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oja.mobile',
  appName: 'OjaMobile',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'none',
    },
  },
};

export default config;
