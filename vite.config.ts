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
        manualChunks: undefined, // Let Vite handle chunking automatically
        preserveModules: false,
      },
      // Ensure proper module resolution
      treeshake: {
        moduleSideEffects: (id) => {
          // Don't tree-shake Mesh SDK - it has complex class hierarchies
          if (id.includes('@meshsdk') || id.includes('@harmoniclabs')) {
            return true;
          }
          return 'no-external';
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'readable-stream',
      'buffer',
      'process'
    ],
    exclude: [
      '@meshsdk/core',
      '@meshsdk/react',
      '@meshsdk/core-csl',
      '@meshsdk/core-cst'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env.NODE_ENV': '"production"'
      },
      keepNames: true // Preserve class names for debugging
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'] // Ensure only one version of React is used
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

