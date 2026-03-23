import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vasalary.manager',
  appName: 'VA Salary Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
