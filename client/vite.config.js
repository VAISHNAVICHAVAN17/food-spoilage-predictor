import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
   test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js', 
  },

  resolve: {
    alias: {
      // optional: additional polyfills for modules like 'buffer'
    }
  }
  
  
});
