import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,

    // ✅ Proxy API requests to Express backend
    proxy: {
      '/customer': 'http://localhost:3001',
      '/staff': 'http://localhost:3001',
      '/tutorial': 'http://localhost:3001',
      '/file': 'http://localhost:3001',
    },

    // ✅ This is what tells Vite to serve index.html on route refresh
    historyApiFallback: true
  }
});
