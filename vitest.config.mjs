import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@example": fileURLToPath(
        new URL("./apps/agent-html-example/src", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: [
      "src/agent-html/**/*.test.ts",
      "src/agent-html/**/*.test.tsx",
      "apps/agent-html-example/src/**/*.test.ts",
      "apps/agent-html-example/src/**/*.test.tsx",
    ],
  },
})
