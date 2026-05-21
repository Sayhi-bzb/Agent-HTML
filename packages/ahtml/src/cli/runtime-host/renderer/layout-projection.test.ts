/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import { parseRenderConfig } from "@agent-html/core"

import {
  resolveArtifactShellStyle,
  resolveLayoutComponentClassName,
  resolveLayoutComponentStyle,
} from "./layout-projection"

describe("layout projection", () => {
  it("projects profile-driven layout styles for layout primitives", () => {
    const artifactProfile = parseRenderConfig({
      "profile-ref": "shadcn-default",
    }).artifactProfile

    expect(resolveLayoutComponentStyle("page", artifactProfile)).toMatchObject({
      gap: artifactProfile.componentLayout.page.gap,
      maxWidth: artifactProfile.globalLayout.measure.wide,
    })
    expect(resolveLayoutComponentStyle("stack", artifactProfile)).toMatchObject({
      gap: artifactProfile.componentLayout.stack.gap,
      maxWidth: artifactProfile.globalLayout.measure.full,
    })
    expect(
      resolveLayoutComponentStyle("cluster", artifactProfile),
    ).toMatchObject({
      gap: artifactProfile.componentLayout.cluster.gap,
      flexWrap: artifactProfile.componentLayout.cluster.wrap,
      justifyContent: artifactProfile.componentLayout.cluster.justify,
    })
    expect(resolveLayoutComponentStyle("split", artifactProfile)).toMatchObject({
      gap: artifactProfile.componentLayout.split.gap,
      gridTemplateColumns: `repeat(${artifactProfile.componentLayout.split.autoFlow}, minmax(${artifactProfile.componentLayout.split.minColumnWidth}, 1fr))`,
    })
    expect(resolveLayoutComponentStyle("grid", artifactProfile)).toMatchObject({
      gap: artifactProfile.componentLayout.grid.gap,
      gridTemplateColumns: `repeat(${artifactProfile.componentLayout.grid.autoFlow}, minmax(${artifactProfile.componentLayout.grid.minColumnWidth}, 1fr))`,
    })
    expect(
      resolveLayoutComponentStyle("switcher", artifactProfile),
    ).toMatchObject({
      gap: artifactProfile.componentLayout.switcher.gap,
      flexWrap: artifactProfile.componentLayout.switcher.wrap,
      justifyContent: artifactProfile.componentLayout.switcher.justify,
      "--ahtml-switcher-min-child-width":
        artifactProfile.componentLayout.switcher.minChildWidth,
      "--ahtml-layout-density": String(
        artifactProfile.globalLayout.density[
          artifactProfile.globalLayout.density.default
        ],
      ),
    })
    expect(resolveLayoutComponentStyle("frame", artifactProfile)).toMatchObject({
      maxWidth: artifactProfile.componentLayout.frame.maxWidth,
      width: artifactProfile.globalLayout.measure.wide,
    })
  })

  it("projects layout primitive class baselines and artifact shell policy styles", () => {
    const artifactProfile = parseRenderConfig({
      "profile-ref": "shadcn-default",
    }).artifactProfile

    expect(resolveLayoutComponentClassName("page")).toBe("grid gap-5")
    expect(resolveLayoutComponentClassName("stack")).toBe("grid")
    expect(resolveLayoutComponentClassName("cluster")).toBe("flex items-start")
    expect(resolveLayoutComponentClassName("frame")).toBe("mx-auto w-full")
    expect(resolveLayoutComponentClassName("card")).toBeUndefined()

    expect(
      resolveArtifactShellStyle(artifactProfile, "document"),
    ).toMatchObject({
      "--ahtml-page-gap": artifactProfile.componentLayout.page.gap,
      "--ahtml-page-max-width": artifactProfile.globalLayout.frame.pageMaxWidth,
      "--ahtml-page-padding-inline":
        artifactProfile.globalLayout.frame.pagePaddingInline,
      "--ahtml-page-padding-block-start":
        artifactProfile.globalLayout.frame.pagePaddingBlockStart,
      "--ahtml-page-padding-block-end":
        artifactProfile.globalLayout.frame.pagePaddingBlockEnd,
    })
    expect(resolveArtifactShellStyle(artifactProfile, "gallery")).toMatchObject({
      "--ahtml-page-gap": artifactProfile.componentLayout.page.gap,
    })
  })

  it("returns undefined for non-layout components or missing profile", () => {
    expect(resolveLayoutComponentStyle("card", undefined)).toBeUndefined()
    expect(resolveArtifactShellStyle(undefined, "document")).toBeUndefined()

    const artifactProfile = parseRenderConfig({
      "profile-ref": "shadcn-default",
    }).artifactProfile

    expect(resolveLayoutComponentStyle("card", artifactProfile)).toBeUndefined()
  })
})
