import type React from "react"

import type { AgentDocument } from "./types"

export type ArtifactProfile = AgentDocument["meta"]["artifactProfile"]
export type ArtifactLayoutPolicy = "document" | "gallery"

export function resolveLayoutComponentClassName(componentName: string) {
  if (componentName === "page") {
    return "grid gap-5"
  }

  if (
    componentName === "stack" ||
    componentName === "split" ||
    componentName === "grid"
  ) {
    return "grid"
  }

  if (componentName === "cluster" || componentName === "switcher") {
    return "flex items-start"
  }

  if (componentName === "frame") {
    return "mx-auto w-full"
  }

  return undefined
}

export function resolveLayoutComponentStyle(
  componentName: string,
  artifactProfile: ArtifactProfile | undefined,
) {
  if (!artifactProfile) {
    return undefined
  }

  const densityScale =
    artifactProfile.globalLayout.density[
      artifactProfile.globalLayout.density.default
    ]

  if (componentName === "page") {
    return {
      gap: artifactProfile.componentLayout.page.gap,
      maxWidth: resolveMeasureWidth(
        artifactProfile.componentLayout.page.measure,
        artifactProfile.globalLayout.measure,
      ),
    } as React.CSSProperties
  }

  if (componentName === "stack") {
    return {
      gap: scaleCssLength(
        artifactProfile.componentLayout.stack.gap,
        artifactProfile.globalLayout.density[
          artifactProfile.componentLayout.stack.density
        ],
      ),
      maxWidth: resolveMeasureWidth(
        artifactProfile.componentLayout.stack.measure,
        artifactProfile.globalLayout.measure,
      ),
    } as React.CSSProperties
  }

  if (componentName === "cluster") {
    return {
      gap: scaleCssLength(
        artifactProfile.componentLayout.cluster.gap,
        artifactProfile.globalLayout.density[
          artifactProfile.componentLayout.cluster.density
        ],
      ),
      flexWrap: artifactProfile.componentLayout.cluster.wrap,
      justifyContent: artifactProfile.componentLayout.cluster.justify,
    } as React.CSSProperties
  }

  if (componentName === "split") {
    return {
      gap: scaleCssLength(
        artifactProfile.componentLayout.split.gap,
        artifactProfile.globalLayout.density[
          artifactProfile.componentLayout.split.density
        ],
      ),
      gridTemplateColumns: `repeat(${artifactProfile.componentLayout.split.autoFlow}, minmax(${artifactProfile.componentLayout.split.minColumnWidth}, 1fr))`,
    } as React.CSSProperties
  }

  if (componentName === "grid") {
    return {
      gap: scaleCssLength(
        artifactProfile.componentLayout.grid.gap,
        artifactProfile.globalLayout.density[
          artifactProfile.componentLayout.grid.density
        ],
      ),
      gridTemplateColumns: `repeat(${artifactProfile.componentLayout.grid.autoFlow}, minmax(${artifactProfile.componentLayout.grid.minColumnWidth}, 1fr))`,
    } as React.CSSProperties
  }

  if (componentName === "switcher") {
    return {
      gap: scaleCssLength(
        artifactProfile.componentLayout.switcher.gap,
        artifactProfile.globalLayout.density[
          artifactProfile.componentLayout.switcher.density
        ],
      ),
      flexWrap: artifactProfile.componentLayout.switcher.wrap,
      justifyContent: artifactProfile.componentLayout.switcher.justify,
      ["--ahtml-switcher-min-child-width" as string]:
        artifactProfile.componentLayout.switcher.minChildWidth,
      ["--ahtml-layout-density" as string]: String(densityScale),
    } as React.CSSProperties
  }

  if (componentName === "frame") {
    return {
      maxWidth: artifactProfile.componentLayout.frame.maxWidth,
      width: resolveMeasureWidth(
        artifactProfile.componentLayout.frame.measure,
        artifactProfile.globalLayout.measure,
      ),
    } as React.CSSProperties
  }

  return undefined
}

export function resolveArtifactShellStyle(
  artifactProfile: ArtifactProfile | undefined,
  layoutPolicy: ArtifactLayoutPolicy,
) {
  if (!artifactProfile) {
    return undefined
  }

  const pageLayout = artifactProfile.componentLayout.page
  const frameLayout = artifactProfile.globalLayout.frame

  return {
    "--ahtml-page-gap": pageLayout.gap,
    ...(layoutPolicy === "document"
      ? {
          "--ahtml-page-max-width": frameLayout.pageMaxWidth,
          "--ahtml-page-padding-inline": frameLayout.pagePaddingInline,
          "--ahtml-page-padding-block-start": frameLayout.pagePaddingBlockStart,
          "--ahtml-page-padding-block-end": frameLayout.pagePaddingBlockEnd,
        }
      : {}),
  } as React.CSSProperties
}

function resolveMeasureWidth(
  token: "prose" | "wide" | "full",
  measure: ArtifactProfile["globalLayout"]["measure"],
) {
  if (token === "prose") {
    return measure.prose
  }

  if (token === "wide") {
    return measure.wide
  }

  return measure.full
}

function scaleCssLength(value: string, factor: number) {
  return factor === 1 ? value : `calc(${value} * ${factor})`
}
