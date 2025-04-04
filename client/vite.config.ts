import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/notes": {
        target: "ws://localhost:3001",
        ws: true,
      },
      "/presence": {
        target: "ws://localhost:3001",
        ws: true,
      },
    },
    allowedHosts: true,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      util: resolve(__dirname, "node_modules/util"),
      inherits: resolve(__dirname, "node_modules/inherits"),
    },
  },
});
