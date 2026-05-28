import { THREAD_LIST_LIMIT } from "./constants"
import type { CodexThreadListState } from "./types"

export function createThreadListParams(cwd?: string | null): {
  cwd?: string
  limit: number
  sortKey: string
  sourceKinds: string[]
} {
  return {
    ...(cwd ? { cwd } : {}),
    limit: THREAD_LIST_LIMIT,
    sortKey: "updated_at",
    sourceKinds: ["appServer", "vscode", "cli"],
  }
}

export function createIdleThreadList(): CodexThreadListState {
  return {
    error: null,
    isLoading: false,
    items: [],
  }
}
