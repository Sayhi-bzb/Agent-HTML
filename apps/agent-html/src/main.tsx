import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "@/app/App"
import { ThemeProvider } from "@/shared/theme-provider"
import { TooltipProvider } from "@/shared/ui/tooltip.tsx"

const AgentHtmlExampleApp = lazy(() =>
  import("@/agent-html-example/app/entry").then((module) => ({
    default: module.AgentHtmlExampleApp,
  }))
)

const rootComponent =
  window.location.pathname === "/agent-html" ? (
    <Suspense fallback={null}>
      <AgentHtmlExampleApp />
    </Suspense>
  ) : (
    <ThemeProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  )

createRoot(document.getElementById("root")!).render(
  <StrictMode>{rootComponent}</StrictMode>
)



