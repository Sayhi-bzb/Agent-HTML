import { dirname } from "node:path"
import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vitest/config"

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: rootDir,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
