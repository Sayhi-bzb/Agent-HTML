import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "../../dist"),
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@/app",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@/agent-html",
        replacement: path.resolve(__dirname, "../../packages/agent-html/src"),
      },
    ],
  },
})
