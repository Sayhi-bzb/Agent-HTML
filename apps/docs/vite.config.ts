import path from "path"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import mdx from "fumadocs-mdx/vite"
import { defineConfig } from "vite"

export default defineConfig({
  root: __dirname,
  plugins: [
    await mdx(),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app"),
      "@source": path.resolve(__dirname, ".source"),
    },
  },
})
