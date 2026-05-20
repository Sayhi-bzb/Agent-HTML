/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import { collectDocsDisciplineViolations } from "./docs-discipline.mjs"

describe("docs discipline", () => {
  it("allows phase summary wording in roadmap and todo", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "roadmap.md",
          content: "`Phase 5` 已完成，进入 post-phase cleanup。",
        },
        {
          relativePath: "todo.md",
          content: "`Phase 5A/5B` 的主线收口已完成。",
        },
      ]),
    ).toEqual([])
  })

  it("rejects phase summary wording outside roadmap and todo", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "details/current-contract-audit.md",
          content: "当前主线已经完成 `Phase 5` 收口。",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "details/current-contract-audit.md",
        label: "phase summary label",
        match: "Phase 5",
      },
    ])
  })

  it("rejects post-phase cleanup wording outside roadmap and todo", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "reading-map.md",
          content: "还剩哪些 post-phase cleanup 欠账",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "reading-map.md",
        label: "post-phase cleanup label",
        match: "post-phase cleanup",
      },
    ])
  })

  it("rejects legacy stage headings everywhere", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "roadmap.md",
          content: "阶段含义：",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "roadmap.md",
        label: "legacy stage heading",
        match: "阶段含义",
      },
    ])
  })

  it("checks every file without leaking regex state across iterations", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "details/current-contract-audit.md",
          content: "第一处 `Phase 5`",
        },
        {
          relativePath: "details/high-risk-runtime-bridges.md",
          content: "第二处 `Phase 5`",
        },
      ]),
    ).toHaveLength(2)
  })

  it("rejects unexpected docs paths", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "phase-5-checklist.md",
          content: "# stray\n",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "phase-5-checklist.md",
        label: "unexpected docs path",
        match: "phase-5-checklist.md",
      },
    ])
  })
})
