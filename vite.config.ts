import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
    sourcemap: false, // Disable sourcemaps to reduce memory usage
    minify: 'esbuild', // Use esbuild instead of terser (faster, less memory)
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep Mesh SDK together - don't split it
          if (id.includes('@meshsdk')) {
            return 'vendor-mesh';
          }
          // React and related
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          // UI libraries
          if (id.includes('framer-motion') || id.includes('recharts') || id.includes('d3')) {
            return 'vendor-ui';
          }
          // Everything else from node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@meshsdk/core',
      '@meshsdk/react',
      'readable-stream'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
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
    }),
  ],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});

