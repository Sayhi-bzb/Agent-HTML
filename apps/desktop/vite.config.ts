import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  clearScreen: false,
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 1420,
    strictPort: true,
  },
  test: {
    environment: "node",
    include: ["scripts/**/*.test.mjs", "src/**/*.test.ts"],
  },
})
