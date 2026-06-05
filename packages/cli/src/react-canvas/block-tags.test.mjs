import { describe, expect, it } from "vitest"

import { collectBlockIds, readAttr, readBlockOpenTags } from "./block-tags.mjs"

describe("React Canvas block tag parser", () => {
  it("collects static Block ids for artifact entry protocol guard", () => {
    const blocks = collectBlockIds(`
      <Artifact title="Demo">
        <Block id="summary" title="Summary">One</Block>
        <Block id={"details"}>Two</Block>
        <Block id={blockId}>Dynamic</Block>
      </Artifact>
    `)

    expect(blocks).toEqual([
      {
        hasIdAttribute: true,
        id: "summary",
        index: expect.any(Number),
        title: "Summary",
      },
      {
        hasIdAttribute: true,
        id: "details",
        index: expect.any(Number),
        title: null,
      },
      {
        hasIdAttribute: true,
        id: null,
        index: expect.any(Number),
        title: null,
      },
    ])
  })

  it("reads quoted attribute forms", () => {
    expect(readAttr('id="summary"', "id")).toBe("summary")
    expect(readAttr("id='summary'", "id")).toBe("summary")
    expect(readAttr('id={ "summary" }', "id")).toBe("summary")
    expect(readAttr("id={ 'summary' }", "id")).toBe("summary")
  })

  it("returns Block open tags without parsing nested source", () => {
    expect(readBlockOpenTags('<Block id="summary"><Block id="nested">').map(
      (block) => block.openTag
    )).toEqual(['<Block id="summary">', '<Block id="nested">'])
  })
})
