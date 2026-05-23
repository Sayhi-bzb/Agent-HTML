import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { AgentHtmlRuntimePreview } from "@/gallery/preview/agent-html/runtime-preview.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"

const rootComponent =
  window.location.pathname === "/agent-html" ? (
    <AgentHtmlRuntimePreview />
  ) : (
    <App />
  )

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        {rootComponent}
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
