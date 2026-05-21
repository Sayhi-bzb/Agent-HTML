import React from "react"

import {
  createArtifactShellCss,
  createDocumentLayoutPolicyCss,
  createGalleryLayoutPolicyCss,
} from "./artifact-shell"

export function RuntimeStyleElements({
  documentStyleCss,
  extraCss,
  galleryPreviewThemeCss,
  includeGalleryShell = false,
}: {
  documentStyleCss: string
  extraCss?: string
  galleryPreviewThemeCss?: string
  includeGalleryShell?: boolean
}) {
  return (
    <>
      <style>{createRuntimeHostCss()}</style>
      <style>{createArtifactShellCss()}</style>
      <style>{createDocumentLayoutPolicyCss()}</style>
      <style>{createGalleryLayoutPolicyCss()}</style>
      {includeGalleryShell ? <style>{createGalleryShellCss()}</style> : null}
      {galleryPreviewThemeCss ? <style>{galleryPreviewThemeCss}</style> : null}
      {extraCss ? <style>{extraCss}</style> : null}
      <style>{documentStyleCss}</style>
    </>
  )
}

export function createRuntimeHostCss() {
  return `
    .ahtml-runtime-host {
      min-height: 100vh;
      background: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
    }
  `
}

export function createGalleryShellCss() {
  return `
    .ahtml-gallery-shell {
      display: grid;
      min-height: 100vh;
      grid-template-rows: auto auto 1fr;
      background:
        radial-gradient(circle at top, color-mix(in srgb, var(--primary) 10%, transparent), transparent 42%),
        linear-gradient(180deg, color-mix(in srgb, var(--muted) 36%, transparent), transparent 28%);
    }
  `
}
