import { describe, expect, it } from "vitest"

import {
  createRuntimeToken,
  runRuntimeSidecar,
  runtimeTokenEnvironmentVariable,
} from "./runtime-command.mjs"

describe("runtime sidecar command", () => {
  it("creates tokens accepted by the runtime session", () => {
    expect(createRuntimeToken()).toHaveLength(43)
  })

  it("refuses to start without a controller-provided token", async () => {
    await expect(
      runRuntimeSidecar({
        args: [],
        cwd: process.cwd(),
        env: {},
      })
    ).rejects.toThrow(`${runtimeTokenEnvironmentVariable} is required`)
  })
})
