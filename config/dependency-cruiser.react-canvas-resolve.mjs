import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export default {
  resolve: {
    alias: {
      "@agent-html/react": path.join(repoRoot, "packages", "react", "src", "index.tsx"),
      "@": path.join(repoRoot, ".agent-html"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
}
