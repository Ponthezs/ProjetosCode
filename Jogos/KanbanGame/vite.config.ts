import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: true },
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'charts', test: /node_modules[\\/](recharts|d3-|victory|decimal\.js)/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-)/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
});
