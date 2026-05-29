import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@/app": fileURLToPath(
        new URL("../apps/agent-html-app/src", import.meta.url)
      ),
      "@/agent-html": fileURLToPath(
        new URL("../packages/agent-html/src", import.meta.url)
      ),
      "@example": fileURLToPath(
        new URL("../apps/agent-html-example/src", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/agent-html/src/**/*.test.ts",
      "packages/agent-html/src/**/*.test.tsx",
      "apps/agent-html-app/src/**/*.test.ts",
      "apps/agent-html-app/src/**/*.test.tsx",
      "apps/agent-html-example/src/**/*.test.ts",
      "apps/agent-html-example/src/**/*.test.tsx",
    ],
  },
})
