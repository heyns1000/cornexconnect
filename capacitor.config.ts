import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cornexconnect.app',
  appName: 'CornexConnect',
  webDir: 'dist/public',
  server: {
    // Production: set this to your deployed backend URL
    // url: 'https://your-production-domain.com',
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#10B981',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#10B981',
    },
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'CornexConnect',
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUrlToDeepLink: false,
  },
};

export default config;
