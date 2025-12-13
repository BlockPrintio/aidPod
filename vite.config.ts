import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@meshsdk')) {
              return 'mesh-vendor';
            }
            if (id.includes('@react-three') || id.includes('three')) {
              return 'three-vendor';
            }
            // Everything else goes to vendor chunk
            return 'vendor';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      'crypto': 'crypto-browserify',
      'node:crypto': 'crypto-browserify',
    },
    dedupe: ['crypto-browserify'],
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    include: ['crypto-browserify'],
  },
  plugins: [
    tsconfigPaths(),
    react(),
    tagger(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
      include: ['stream', 'crypto'],
      overrides: {
        'readable-stream': 'stream-browserify',
        crypto: 'crypto-browserify',
      },
    }),
  ],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});

