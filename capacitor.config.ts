import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cornexconnect.app',
  appName: 'CornexConnect',
  webDir: 'dist/public',
  server: {
    // For development - point to local server
    // url: 'http://localhost:5000',
    // cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#10B981',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#10B981',
    },
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'CornexConnect',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
