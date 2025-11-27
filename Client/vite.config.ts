import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      // Expose the server-loaded GEMINI_API_KEY as a client `import.meta.env.VITE_API_KEY`.
      // This supports projects that keep secrets as GEMINI_API_KEY on the dev machine
      // but still read them as `import.meta.env.VITE_API_KEY` in client code.
      define: {
        'import.meta.env.VITE_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
