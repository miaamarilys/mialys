import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    allowedHosts: true,
  },
});
