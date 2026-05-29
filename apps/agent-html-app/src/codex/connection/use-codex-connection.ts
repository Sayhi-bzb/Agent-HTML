import * as React from "react"

import { CodexConnectionContext } from "./context"

export function useCodexConnection() {
  const context = React.useContext(CodexConnectionContext)
  if (!context) {
    throw new Error("useCodexConnection must be used within CodexConnectionProvider")
  }

  return context
}
