import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: [
      "src/agent-html/**/*.test.ts",
      "src/agent-html/**/*.test.tsx",
      "src/agent-html-example/**/*.test.ts",
      "src/agent-html-example/**/*.test.tsx",
    ],
  },
})
