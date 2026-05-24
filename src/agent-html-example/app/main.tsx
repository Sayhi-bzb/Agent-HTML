import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/app/index.css"
import { AgentHtmlExampleApp } from "@/agent-html-example/app/app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AgentHtmlExampleApp />
  </StrictMode>
)
