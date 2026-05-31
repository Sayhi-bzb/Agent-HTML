import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { RootApp } from "@/app/root-app"
import { AppliedAppThemeProvider } from "@/app/shared/app-theme/applied-theme-provider"
import { LanguageProvider } from "@/app/shared/language-provider"
import { ThemeProvider } from "@/app/shared/theme-provider"
import { TooltipProvider } from "@/app/shared/ui/tooltip.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <AppliedAppThemeProvider>
          <TooltipProvider>
            <RootApp />
          </TooltipProvider>
        </AppliedAppThemeProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
)
