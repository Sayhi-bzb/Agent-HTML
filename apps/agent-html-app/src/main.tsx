import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "@/app/App"
import { CodexConnectionProvider } from "@/app/codex/connection"
import { PetWindowApp } from "@/app/pet/host/pet-window-app"
import { LanguageProvider } from "@/app/shared/language-provider"
import { ThemeProvider } from "@/app/shared/theme-provider"
import { TooltipProvider } from "@/app/shared/ui/tooltip.tsx"

const isPetWindow =
  new URLSearchParams(window.location.search).get("window") === "pet"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          {isPetWindow ? (
            <PetWindowApp />
          ) : (
            <CodexConnectionProvider>
              <App />
            </CodexConnectionProvider>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
)
