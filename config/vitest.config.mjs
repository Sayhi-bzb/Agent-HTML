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
      "@/lib": fileURLToPath(new URL("../.agent-html/lib", import.meta.url)),
      "@/ui": fileURLToPath(new URL("../.agent-html/ui", import.meta.url)),
      "@agent-html/react": fileURLToPath(
        new URL("../packages/react/src/index.tsx", import.meta.url)
      ),
      "@example": fileURLToPath(
        new URL("../apps/agent-html-example/src", import.meta.url)
      ),
      "#agent-html-playground": fileURLToPath(
        new URL("../.agent-html", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/agent-html/src/**/*.test.ts",
      "packages/agent-html/src/**/*.test.tsx",
      "packages/react/src/**/*.test.ts",
      "packages/react/src/**/*.test.tsx",
      "packages/cli/src/**/*.test.mjs",
      "packages/cli/src/**/*.test.ts",
      "packages/cli/src/**/*.test.tsx",
      "apps/agent-html-app/src/**/*.test.ts",
      "apps/agent-html-app/src/**/*.test.tsx",
      "apps/agent-html-example/src/**/*.test.ts",
      "apps/agent-html-example/src/**/*.test.tsx",
    ],
  },
})
