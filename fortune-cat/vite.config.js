import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import aitDevtools from '@apps-in-toss/devtools/unplugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [aitDevtools.vite(), react()],
  optimizeDeps: {
    exclude: [
      '@granite-js/react-native',
      'react-native',
      '@toss/tds-react-native',
      '@react-native-community/blur',
      'react-native-webview',
      'react-native-video'
    ],
  },
  build: {
    commonjsOptions: {
      ignore: ['react-native', '@granite-js/react-native']
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
