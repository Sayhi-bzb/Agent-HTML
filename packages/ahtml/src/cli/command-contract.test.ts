/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

describe("command contract", () => {
  it("defines shared formats for commands that expose --format", async () => {
    const { commandMetadata, resolveCommandFormat } =
      await importCommandContract()

    expect(
      resolveCommandFormat("prompt", commandMetadata.prompt, undefined),
    ).toBe("prompt")
    expect(
      resolveCommandFormat("build", commandMetadata.build, undefined),
    ).toBe("text")
    expect(resolveCommandFormat("doctor", commandMetadata.doctor, "json")).toBe(
      "json",
    )
    expect(() =>
      resolveCommandFormat("inspect", commandMetadata.inspect, "yaml"),
    ).toThrow('inspect --format must be "summary" or "json".')
  })

  it("defines the same default interactive actions used by the cli entrypoint", async () => {
    const { defaultActionMenuItems } = await importCommandContract()

    expect(defaultActionMenuItems).toEqual([
      expect.objectContaining({ value: "prompt" }),
      expect.objectContaining({ value: "build" }),
      expect.objectContaining({ value: "preview" }),
      expect.objectContaining({ value: "doctor" }),
      expect.objectContaining({ value: "help" }),
    ])
  })
})

async function importCommandContract() {
  return importCliModule<{
    readonly commandMetadata: {
      readonly prompt: {
        readonly formats?: {
          readonly defaultValue: string
          readonly values: readonly string[]
        }
      }
      readonly build: {
        readonly formats?: {
          readonly defaultValue: string
          readonly values: readonly string[]
        }
      }
      readonly doctor: {
        readonly formats?: {
          readonly defaultValue: string
          readonly values: readonly string[]
        }
      }
      readonly inspect: {
        readonly formats?: {
          readonly defaultValue: string
          readonly values: readonly string[]
        }
      }
    }
    readonly defaultActionMenuItems: readonly { readonly value: string }[]
    readonly resolveCommandFormat: (
      commandName: string,
      definition: {
        readonly formats?: {
          readonly defaultValue: string
          readonly values: readonly string[]
        }
      },
      value: string | undefined,
    ) => string
  }>("command-contract.mjs")
}
