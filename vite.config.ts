import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public", // Explicitly tell Vite to copy public folder
  build: {
    assetsInclude: ["**/*.png", "**/*.json", "**/*.js"], // Ensure static assets are included
    copyPublicDir: true, // Ensure public folder is copied
  },
}));
