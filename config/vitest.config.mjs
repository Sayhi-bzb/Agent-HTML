import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@/lib": fileURLToPath(new URL("../.agent-html/lib", import.meta.url)),
      "@/ui": fileURLToPath(new URL("../.agent-html/ui", import.meta.url)),
      "@agent-html/react": fileURLToPath(
        new URL("../packages/react/src/index.tsx", import.meta.url)
      ),
      "#agent-html-playground": fileURLToPath(
        new URL("../.agent-html", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/react/src/**/*.test.ts",
      "packages/react/src/**/*.test.tsx",
      "packages/cli/src/**/*.test.mjs",
      "packages/cli/src/**/*.test.ts",
      "packages/cli/src/**/*.test.tsx",
    ],
  },
})
