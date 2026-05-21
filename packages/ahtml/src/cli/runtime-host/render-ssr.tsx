import { renderToStaticMarkup } from "react-dom/server"

import { App } from "./app"

export function renderRuntimeAppToHtml() {
  return renderToStaticMarkup(<App />)
}
