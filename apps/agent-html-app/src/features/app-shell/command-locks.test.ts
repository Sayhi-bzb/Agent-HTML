import { describe, expect, it } from "vitest"

import { deriveCommandLocks } from "./command-locks"
import { initialCommandState } from "./types"

describe("deriveCommandLocks", () => {
  it("leaves session interactions available when no commands are running", () => {
    const locks = deriveCommandLocks({
      ...initialCommandState,
      loading: false,
    })

    expect(locks.sessionNavigationLocked).toBe(false)
    expect(locks.workbenchInteractionLocked).toBe(false)
    expect(locks.sourceEditingLocked).toBe(false)
    expect(locks.shellComposeLocked).toBe(false)
    expect(locks.proposalLocked).toBe(false)
    expect(locks.runtimeCheckLocked).toBe(false)
  })

  it("locks session-scoped interactions while a session command is running", () => {
    const locks = deriveCommandLocks({
      ...initialCommandState,
      loading: false,
      building: true,
    })

    expect(locks.sessionNavigationLocked).toBe(true)
    expect(locks.workbenchInteractionLocked).toBe(true)
    expect(locks.sourceEditingLocked).toBe(true)
    expect(locks.shellComposeLocked).toBe(true)
    expect(locks.proposalLocked).toBe(true)
    expect(locks.runtimeCheckLocked).toBe(true)
  })

  it("keeps session interactions available while only the runtime check is running", () => {
    const locks = deriveCommandLocks({
      ...initialCommandState,
      loading: false,
      checking: true,
    })

    expect(locks.sessionNavigationLocked).toBe(false)
    expect(locks.workbenchInteractionLocked).toBe(false)
    expect(locks.sourceEditingLocked).toBe(false)
    expect(locks.shellComposeLocked).toBe(false)
    expect(locks.proposalLocked).toBe(false)
    expect(locks.runtimeCheckLocked).toBe(true)
  })
})
