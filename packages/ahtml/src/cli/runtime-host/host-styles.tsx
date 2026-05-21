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
      box-sizing: border-box;
      min-height: 100vh;
      background: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
      --ahtml-shell-header-gap: 0.85rem;
      --ahtml-shell-toolbar-gap: 0.75rem;
      --ahtml-shell-toolbar-min-height: 3.5rem;
      --ahtml-shell-padding-inline: 1rem;
      --ahtml-shell-padding-block: 0.7rem;
      --ahtml-shell-mobile-tabs-padding-top: 0.6rem;
      --ahtml-shell-filter-padding-top: 0.6rem;
      --ahtml-shell-filter-padding-bottom: 0.4rem;
      --ahtml-shell-preview-toolbar-padding-block: 0.55rem;
      --ahtml-shell-stage-toolbar-padding-block: 0.85rem;
      --ahtml-shell-section-padding-inline: 0.9rem;
      --ahtml-shell-section-padding-bottom: 0.9rem;
    }
    @media (max-width: 720px) {
      .ahtml-runtime-host {
        --ahtml-shell-padding-inline: 0.8rem;
        --ahtml-shell-section-padding-inline: 0.75rem;
      }
    }
  `
}

export function createGalleryShellCss() {
  return `
    .ahtml-gallery-shell {
      --ahtml-gallery-sidebar-width: min(31rem, 33vw);
      --ahtml-gallery-sidebar-min-width: 20rem;
      --ahtml-gallery-divider-width: 0.75rem;
      --ahtml-gallery-preset-rail-gap: 1rem;
      --ahtml-gallery-preset-workbar-gap: 0.8rem;
      --ahtml-gallery-preset-inline-gap: 0.75rem;
      --ahtml-gallery-preset-trigger-min-width: min(100%, 18rem);
      --ahtml-gallery-preset-select-min-width: min(100%, 16rem);
      --ahtml-gallery-preset-trigger-gap: 0.8rem;
      --ahtml-gallery-preset-popover-width: min(30rem, calc(100vw - 2rem));
      --ahtml-gallery-preset-popover-padding: 0.75rem;
      --ahtml-gallery-preset-popover-gap: 0.75rem;
      --ahtml-gallery-preset-list-max-height: 18rem;
      --ahtml-gallery-preview-mode-tools-gap: 0.75rem;
      --ahtml-gallery-stage-panel-gap: 1rem;
      --ahtml-gallery-stage-toolbar-gap: 0.75rem;
      --ahtml-gallery-layout-gap: 1rem;
      --ahtml-gallery-layout-gap-compact: 0.75rem;
      --ahtml-gallery-layout-gap-relaxed: 0.85rem;
      --ahtml-gallery-layout-inline-padding: 1rem;
      --ahtml-gallery-layout-block-padding: 1rem;
      --ahtml-gallery-custom-stage-secondary-min-width: 18rem;
      --ahtml-gallery-custom-card-min-width: 18rem;
      --ahtml-gallery-dashboard-sidebar-width: 14rem;
      --ahtml-gallery-dashboard-secondary-min-width: 16rem;
      --ahtml-gallery-mail-nav-width: 13rem;
      --ahtml-gallery-mail-list-min-width: 15rem;
      --ahtml-gallery-mail-list-max-width: 18rem;
      --ahtml-gallery-stage-frame-padding-inline: 0.9rem;
      --ahtml-gallery-stage-frame-padding-top: 0.9rem;
      --ahtml-gallery-stage-frame-padding-bottom: 1.1rem;
      --ahtml-gallery-stage-frame-mode-padding-top: 0.7rem;
      --ahtml-gallery-stage-frame-mode-padding-inline: 0.7rem;
      --ahtml-gallery-preview-surface-inner-padding: 1rem;
      --ahtml-gallery-inspector-overlay-padding-inline: 0.75rem;
      --ahtml-gallery-inspector-overlay-padding-top: 0.75rem;
      --ahtml-gallery-panel-max-width: 72rem;
      --ahtml-gallery-panel-max-width-reading: 68rem;
      --ahtml-gallery-panel-max-width-wide: 76rem;
      --ahtml-gallery-footer-card-min-width: 12rem;
      --ahtml-gallery-color-hero-card-min-width: 11rem;
      --ahtml-gallery-color-grid-card-min-width: 14rem;
      --ahtml-gallery-color-mode-card-min-width: 18rem;
      --ahtml-gallery-typography-sample-min-width: 15rem;
      --ahtml-gallery-typography-token-min-width: 14rem;
      --ahtml-gallery-content-card-padding: 1rem;
      --ahtml-gallery-content-card-padding-relaxed: 0.9rem;
      --ahtml-gallery-compact-panel-padding-inline: 0.85rem;
      --ahtml-gallery-compact-panel-padding-block: 0.7rem;
      --ahtml-gallery-tight-toolbar-padding-block: 0.6rem;
      --ahtml-gallery-custom-hero-padding: 1.3rem;
      --ahtml-gallery-custom-preview-empty-padding-block: 1.4rem;
      --ahtml-gallery-custom-preview-input-min-width: min(100%, 24rem);
      --ahtml-gallery-custom-preview-steps-max-width: 30rem;
      --ahtml-gallery-inspector-panel-max-width: min(100%, 24rem);
      --ahtml-gallery-custom-rich-columns: repeat(3, minmax(0, 1fr));
      --ahtml-gallery-custom-stat-columns: repeat(3, minmax(0, 1fr));
      --ahtml-gallery-custom-swatch-columns: repeat(4, minmax(0, 1fr));
      --ahtml-gallery-cards-workbench-columns: minmax(0, 1.3fr) minmax(0, 1fr);
      --ahtml-gallery-cards-split-columns: repeat(2, minmax(0, 1fr));
      --ahtml-gallery-dashboard-card-columns: repeat(4, minmax(0, 1fr));
      --ahtml-gallery-dashboard-chart-footer-columns: repeat(2, minmax(0, 1fr));
      --ahtml-gallery-mail-attachment-columns: repeat(2, minmax(0, 1fr));
      --ahtml-gallery-pricing-columns: repeat(2, minmax(0, 1fr));
      display: grid;
      min-height: 100vh;
      grid-template-rows: auto auto 1fr;
      background:
        radial-gradient(circle at top, color-mix(in srgb, var(--primary) 10%, transparent), transparent 42%),
        linear-gradient(180deg, color-mix(in srgb, var(--muted) 36%, transparent), transparent 28%);
    }
  `
}
