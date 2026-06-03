import { createRoot, type Root } from "react-dom/client"

import { ReactCanvasHostApp } from "./app"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("#root is required")
}

const root: Root = createRoot(rootElement)
root.render(<ReactCanvasHostApp />)
