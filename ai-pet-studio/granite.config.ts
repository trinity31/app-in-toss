import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ai-pet-studio',
  brand: {
    displayName: 'AI 펫 사진관',
    icon: 'https://static.toss.im/appsintoss/7011/c2ee99be-8729-4b79-850e-2bd528ad7be7.png',
    primaryColor: '#ff8c43',
    bridgeColorMode: 'basic',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  web: {
    host: '192.168.0.25',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [
    { name: 'camera', access: 'access' },
    { name: 'photos', access: 'read' },
  ],
  outdir: 'dist',
});
