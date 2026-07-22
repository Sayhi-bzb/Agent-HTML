import { parse } from "@babel/parser"
import { describe, expect, it } from "vitest"

import {
  reorderStaticCanvasNodes,
  reparentStaticCanvasNodes,
} from "./canvas-hierarchy-source.mjs"

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

describe("Canvas layer source editing", () => {
  it("reorders static sibling slots while preserving wrappers and content", () => {
    const source = `import { Canvas as C, Node as N } from "@agent-html/react"

export default function Demo() {
  return (
    <C>
      <p>before</p>
      <>
        <N id="a"><span>A</span></N>
        {/* keep */}
        <N id="b"><span>B</span></N>
      </>
      <N id="c"><span>C</span></N>
    </C>
  )
}
`
    const result = reorderStaticCanvasNodes({
      groups: [{ nodeIds: ["b", "c", "a"], parentId: null }],
      source,
    }).source
    expect(result.indexOf('id="b"')).toBeLessThan(result.indexOf('id="c"'))
    expect(result.indexOf('id="c"')).toBeLessThan(result.indexOf('id="a"'))
    expect(result).toContain("{/* keep */}")
    expect(result).toContain("<p>before</p>")
  })

  it("reorders nested groups before moving their parent slots", () => {
    const source = `import { Canvas, Node } from "@agent-html/react"
export default () => <Canvas>
  <Node id="a"><Node id="a1" /><Node id="a2" /></Node>
  <Node id="b" />
</Canvas>`
    const result = reorderStaticCanvasNodes({
      groups: [
        { nodeIds: ["b", "a"], parentId: null },
        { nodeIds: ["a2", "a1"], parentId: "a" },
      ],
      source,
    }).source
    expect(result.indexOf('id="b"')).toBeLessThan(result.indexOf('id="a"'))
    expect(result.indexOf('id="a2"')).toBeLessThan(result.indexOf('id="a1"'))
  })

  it("rejects incomplete or non-static sibling groups", () => {
    const source = `import { Canvas, Node } from "@agent-html/react"
export default () => <Canvas><Node id="a" /><Node id="b" /></Canvas>`
    expect(() =>
      reorderStaticCanvasNodes({
        groups: [{ nodeIds: ["b"], parentId: null }],
        source,
      })
    ).toThrow("must contain every static sibling Node")
  })
})
