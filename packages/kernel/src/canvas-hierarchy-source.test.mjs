import { parse } from "@babel/parser"
import { describe, expect, it } from "vitest"

import { reparentStaticCanvasNodes } from "./canvas-hierarchy-source.mjs"

const source = `import { Canvas, Node } from "@agent-html/react"

export default function Demo() {
  return (
    <Canvas>
      <Node id="parent">
        <div>Parent</div>
        <Node id="child">Child</Node>
      </Node>
      <Node id="target">Target</Node>
    </Canvas>
  )
}
`

describe("Canvas hierarchy source editing", () => {
  it("moves complete Node JSX into another Node and remains valid TSX", () => {
    const result = reparentStaticCanvasNodes({
      nodeIds: ["child"],
      parentId: "target",
      source,
    })
    expect(result.source.indexOf('<Node id="target">')).toBeLessThan(
      result.source.indexOf('<Node id="child">')
    )
    expect(() =>
      parse(result.source, {
        plugins: ["jsx", "typescript"],
        sourceType: "module",
      })
    ).not.toThrow()
  })

  it("supports aliased Canvas imports", () => {
    const aliased = source
      .replace("{ Canvas, Node }", "{ Canvas as Surface, Node as Item }")
      .replaceAll("<Canvas", "<Surface")
      .replaceAll("</Canvas", "</Surface")
      .replaceAll("<Node", "<Item")
      .replaceAll("</Node", "</Item")
    expect(() =>
      reparentStaticCanvasNodes({
        nodeIds: ["child"],
        parentId: null,
        source: aliased,
      })
    ).not.toThrow()
  })

  it("rejects dynamic Node ids without rewriting source", () => {
    expect(() =>
      reparentStaticCanvasNodes({
        nodeIds: ["child"],
        parentId: null,
        source: source.replace('id="child"', "id={childId}"),
      })
    ).toThrow(/static string Node ids/)
  })
})
