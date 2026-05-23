import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"

const AgentHtmlRuntimeDemo = lazy(() =>
  import("@/agent-html-example/entry").then((module) => ({
    default: module.AgentHtmlRuntimeDemo,
  }))
)

const rootComponent =
  window.location.pathname === "/agent-html" ? (
    <Suspense fallback={null}>
      <AgentHtmlRuntimeDemo />
    </Suspense>
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



