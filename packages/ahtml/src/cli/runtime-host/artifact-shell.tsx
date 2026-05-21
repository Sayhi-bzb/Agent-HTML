import React from "react"

import {
  resolveArtifactShellStyle,
  type ArtifactLayoutPolicy,
} from "./renderer/layout-projection"
import type { AgentDocument } from "./renderer/types"

export type ArtifactProfile = AgentDocument["meta"]["artifactProfile"]

export function DocumentArtifactShell({
  children,
  className,
  artifactProfile,
  layoutPolicy = "document",
}: React.PropsWithChildren<{
  className?: string
  artifactProfile?: ArtifactProfile
  layoutPolicy?: ArtifactLayoutPolicy
}>) {
  const classes = [
    "ahtml-artifact-root",
    layoutPolicy === "document"
      ? "ahtml-layout-policy-document"
      : "ahtml-layout-policy-gallery",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={classes}
      style={resolveArtifactShellStyle(artifactProfile, layoutPolicy)}
    >
      {children}
    </div>
  )
}

export function createArtifactShellCss() {
  return `
    .ahtml-artifact-root {
      box-sizing: border-box;
      display: grid;
      gap: var(--ahtml-page-gap, calc(var(--spacing) * 4));
    }
    .ahtml-artifact-root > * {
      min-width: 0;
    }
    .ahtml-artifact-root [data-agent-html-component="page"] > * {
      min-width: 0;
    }
  `
}

export function createDocumentLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-document {
      width: min(var(--ahtml-page-max-width, 72rem), calc(100vw - calc(var(--ahtml-page-padding-inline, 1rem) * 2)));
      margin: 0 auto;
      padding:
        var(--ahtml-page-padding-block-start, 1.5rem)
        var(--ahtml-page-padding-inline, 1rem)
        var(--ahtml-page-padding-block-end, 3rem);
    }
  `
}

export function createGalleryLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-gallery {
      width: 100%;
      padding: 0;
      display: grid;
      align-items: start;
      gap: var(--ahtml-page-gap, calc(var(--spacing) * 4));
    }
    .ahtml-layout-policy-gallery > * {
      min-width: 0;
    }
  `
}
