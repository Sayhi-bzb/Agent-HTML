import { afterEach, describe, expect, it } from "vitest"

import {
  readSyncedStorageValue,
  subscribeSyncedStorageKey,
  writeSyncedStorageValue,
} from "@/app/shared/storage-sync"

const originalWindow = globalThis.window
const originalLocalStorage = globalThis.localStorage

function installStorageWindow() {
  const target = new EventTarget() as Window & typeof globalThis
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  } as Storage

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: target,
  })
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  })

  return { storage, target }
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  })
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: originalLocalStorage,
  })
})

describe("synced storage", () => {
  it("notifies same-window subscribers when writing a key", () => {
    installStorageWindow()
    let calls = 0
    const unsubscribe = subscribeSyncedStorageKey("example", () => {
      calls += 1
    })

    writeSyncedStorageValue({ storageKey: "example", value: "saved" })

    expect(calls).toBe(1)
    expect(
      readSyncedStorageValue({
        defaultValue: "fallback",
        parse: (value) => value,
        storageKey: "example",
      })
    ).toBe("saved")

    unsubscribe()
  })

  it("notifies subscribers for cross-window storage events", () => {
    const { storage, target } = installStorageWindow()
    let calls = 0
    subscribeSyncedStorageKey("example", () => {
      calls += 1
    })

    const event = new Event("storage")
    Object.defineProperty(event, "key", { value: "example" })
    Object.defineProperty(event, "storageArea", { value: storage })

    target.dispatchEvent(event)

    expect(calls).toBe(1)
  })
})
