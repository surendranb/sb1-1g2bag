import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Handle process.env replacement for Vite
    'process.env': {}
  }
});