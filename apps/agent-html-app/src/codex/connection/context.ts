import * as React from "react"

import type { CodexConnectionContextValue } from "./types"

export const CodexConnectionContext = React.createContext<
  CodexConnectionContextValue | undefined
>(undefined)
