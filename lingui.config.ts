import { defineConfig } from "@lingui/cli"
import { formatter } from "@lingui/format-po"

export default defineConfig({
  compileNamespace: "es",
  sourceLocale: "en",
  locales: ["en", "zh"],
  catalogs: [
    {
      path: "<rootDir>/apps/agent-html-app/src/locales/{locale}/messages",
      include: ["<rootDir>/apps/agent-html-app/src/shell/settings-menu.tsx"],
    },
  ],
  format: formatter({ lineNumbers: false }),
})
