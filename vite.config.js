const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react-swc");
const { resolve } = require("path");
const tailwindcss = require("tailwindcss");
const tsconfigPaths = require("vite-tsconfig-paths").default;

module.exports = defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"]
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      followSymlinks: false
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["plankton-app-v6zgk.ondigitalocean.app"]
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  optimizeDeps: {
    include: ["axios", "react-icons"]
  },
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  }
});
