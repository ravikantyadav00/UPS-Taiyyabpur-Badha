import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.upstaiyyabpurbadha.school',
  appName: 'UPS Taiyyabpur Badha',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B1F3A',
    },
  },
};

export default config;
