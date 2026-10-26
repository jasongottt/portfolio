import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The world's chunk (three.js) is about 500 kB, 130 kB gzipped, and loads
    // after first paint (src/world/WorldBackground.jsx), so it doesn't hold
    // up the page.
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})