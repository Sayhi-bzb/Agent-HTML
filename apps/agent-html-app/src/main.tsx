import React from "react"
import ReactDOM from "react-dom/client"

import { App } from "./app"
import { TooltipProvider } from "./components/ui/tooltip"
import "./styles.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </React.StrictMode>,
)
