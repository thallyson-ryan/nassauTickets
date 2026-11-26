import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, /api é repassado ao backend (evita problemas de CORS).
// Para outro endereço, defina VITE_API_URL no frontend/.env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    server: {
      proxy: { '/api': env.VITE_API_URL || 'http://localhost:3000' },
    },
  };
});
