import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ai-profile-photo-studio',
  brand: {
    displayName: 'AI 프로필 스튜디오',
    icon: 'https://static.toss.im/appsintoss/7011/38bc18e7-84fa-4ed5-b902-4165ddc83795.png',
    primaryColor: '#3182F6',
    bridgeColorMode: 'basic',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  permissions: [
    { name: 'camera', access: 'access' },
    { name: 'photos', access: 'read' },
  ],
  web: {
    host: '192.168.0.26',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  outdir: 'dist',
});
