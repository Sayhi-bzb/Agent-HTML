// @vitest-environment jsdom

import * as React from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import {
  Canvas,
  CanvasIntentProvider,
  Node,
  type CanvasIntentRuntime,
  type CanvasNodeIntent,
} from "./canvas"

const roots: Array<ReturnType<typeof createRoot>> = []

afterEach(() => {
  roots.splice(0).forEach((root) => root.unmount())
  document.body.innerHTML = ""
})

function createRuntime(target: HTMLElement) {
  const nodes = new Map<string, CanvasNodeIntent>()
  const runtime: CanvasIntentRuntime = {
    getNodeTarget: () => target,
    removeNode: (id) => nodes.delete(id),
    setCanvasActive: () => {},
    subscribeTargets: () => () => {},
    upsertNode: (node) => nodes.set(node.id, node),
  }
  return { nodes, runtime }
}

describe("Canvas authoring components", () => {
  it("registers spatial intent and portals React content", async () => {
    const host = document.createElement("div")
    const target = document.createElement("div")
    document.body.append(host, target)
    const { nodes, runtime } = createRuntime(target)
    const root = createRoot(host)
    roots.push(root)

    root.render(
      <CanvasIntentProvider runtime={runtime}>
        <Canvas>
          <Node id="profile">
            <input aria-label="Profile" defaultValue="Ada" />
          </Node>
        </Canvas>
      </CanvasIntentProvider>
    )

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(nodes.get("profile")).toEqual({ id: "profile" })
    expect(target.querySelector("input")?.getAttribute("value")).toBe("Ada")
  })

  it("derives hierarchy from nested JSX while keeping separate portals", async () => {
    const host = document.createElement("div")
    const parentTarget = document.createElement("div")
    const childTarget = document.createElement("div")
    document.body.append(host, parentTarget, childTarget)
    const nodes = new Map<string, CanvasNodeIntent>()
    const runtime: CanvasIntentRuntime = {
      getNodeTarget: (id) =>
        id === "parent" ? parentTarget : id === "child" ? childTarget : null,
      removeNode: (id) => nodes.delete(id),
      setCanvasActive: () => {},
      subscribeTargets: () => () => {},
      upsertNode: (node) => nodes.set(node.id, node),
    }
    const root = createRoot(host)
    roots.push(root)

    root.render(
      <CanvasIntentProvider runtime={runtime}>
        <Canvas>
          <Node id="parent">
            <span>Parent</span>
            <Node id="child">
              <span>Child</span>
            </Node>
          </Node>
        </Canvas>
      </CanvasIntentProvider>
    )

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(nodes.get("child")).toMatchObject({
      id: "child",
      parentId: "parent",
    })
    expect(parentTarget.textContent).toBe("Parent")
    expect(childTarget.textContent).toBe("Child")
  })

  it("keeps React context and state interactive through the Node portal", async () => {
    const host = document.createElement("div")
    const target = document.createElement("div")
    document.body.append(host, target)
    const { runtime } = createRuntime(target)
    const root = createRoot(host)
    roots.push(root)
    const LabelContext = React.createContext("missing")

    function InteractiveContent() {
      const label = React.useContext(LabelContext)
      const [count, setCount] = React.useState(0)
      return (
        <button onClick={() => setCount((value) => value + 1)}>
          {label}:{count}
        </button>
      )
    }

    root.render(
      <LabelContext.Provider value="portal">
        <CanvasIntentProvider runtime={runtime}>
          <Canvas>
            <Node id="form">
              <InteractiveContent />
            </Node>
          </Canvas>
        </CanvasIntentProvider>
      </LabelContext.Provider>
    )

    await new Promise((resolve) => setTimeout(resolve, 0))
    const button = target.querySelector("button")
    expect(button?.textContent).toBe("portal:0")
    button?.click()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(button?.textContent).toBe("portal:1")
  })
})
