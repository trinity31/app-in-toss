import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'fortune-cat',
  brand: {
    displayName: '복냥사주&타로', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#64119F', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/7011/eb6e95b2-de8d-4ca5-9025-662cfd7ece00.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: 'basic',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  web: {
    host: '192.168.0.28',
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
