import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@example/global.css"
import { AgentHtmlExampleApp } from "@example/app/app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AgentHtmlExampleApp />
  </StrictMode>
)
