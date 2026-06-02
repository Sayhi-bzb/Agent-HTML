import { defineConfig } from "@lingui/cli"
import { formatter } from "@lingui/format-po"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export default defineConfig({
  compileNamespace: "es",
  rootDir,
  sourceLocale: "en",
  locales: ["en", "zh"],
  catalogs: [
    {
      path: "<rootDir>/apps/agent-html-app/src/locales/{locale}/messages",
      include: ["<rootDir>/apps/agent-html-app/src/**/*.{ts,tsx}"],
      exclude: [
        "<rootDir>/apps/agent-html-app/src/**/*.test.{ts,tsx}",
        "<rootDir>/apps/agent-html-app/src/locales/**",
        "<rootDir>/apps/agent-html-app/src/workspace/fixtures/**",
      ],
    },
  ],
  format: formatter({ lineNumbers: false }),
})
