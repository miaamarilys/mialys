import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { handleApiRequest } = require("./apiHandler.cjs");

function supabaseApiPlugin() {
  return {
    name: "supabase-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/")) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), supabaseApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    allowedHosts: true,
  },
});
