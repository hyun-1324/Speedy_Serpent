import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // ✅ Minify(압축) 비활성화 (디버깅용)
    terserOptions: {
      compress: {
        drop_console: false, // ✅ console.log 유지
      },
    },
  },
});
