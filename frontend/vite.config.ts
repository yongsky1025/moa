import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
      '/circles': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
      '/ws': { target: 'http://localhost:8080', changeOrigin: true, secure: false, ws: true },
    },
  },
});
