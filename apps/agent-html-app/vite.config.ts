import path from "path"
import { lingui } from "@lingui/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "../../dist"),
    emptyOutDir: true,
  },
  plugins: [
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui({
      configPath: path.resolve(__dirname, "../../config/lingui.config.ts"),
    }),
    tailwindcss(),
  ],
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
