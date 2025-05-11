import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
    lib: {
      name: 'web-ui',
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'web-ui',
      formats: ['es']
    },
    rollupOptions: {
      maxParallelFileOps: 2,
      cache: false,
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        sourcemap: true,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        inlineDynamicImports: false,
        // sourcemapIgnoreList: (relativeSourcePath) => {
        //   const normalizedPath = path.normalize(relativeSourcePath);
        //   return normalizedPath.includes('node_modules');
        // },
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      followSymlinks: false,
    },
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["@axios", "@react-icons"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
