import path from "path"
import { fileURLToPath } from "url"
import { lingui } from "@lingui/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const configDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: configDir,
  build: {
    outDir: path.resolve(configDir, "../../dist"),
    emptyOutDir: true,
  },
  plugins: [
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui({
      configPath: path.resolve(configDir, "../../config/lingui.config.ts"),
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: "@/app",
        replacement: path.resolve(configDir, "src"),
      },
      {
        find: "@/agent-html",
        replacement: path.resolve(configDir, "../../packages/agent-html/src"),
      },
    ],
  },
})
