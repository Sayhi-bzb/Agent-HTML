import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "@/app/App"
import { CodexConnectionProvider } from "@/app/codex/connection"
import { ThemeProvider } from "@/app/shared/theme-provider"
import { TooltipProvider } from "@/app/shared/ui/tooltip.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <CodexConnectionProvider>
          <App />
        </CodexConnectionProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
