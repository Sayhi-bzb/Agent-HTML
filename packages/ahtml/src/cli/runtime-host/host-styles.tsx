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
      --ahtml-space-2xs: 0.35rem;
      --ahtml-space-xs: 0.45rem;
      --ahtml-space-sm: 0.5rem;
      --ahtml-space-md: 0.55rem;
      --ahtml-space-lg: 0.7rem;
      --ahtml-surface-padding-sm: 0.8rem;
      --ahtml-surface-padding-md: 0.9rem;
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
      --ahtml-gallery-two-up-columns: repeat(2, minmax(0, 1fr));
      --ahtml-gallery-three-up-columns: repeat(3, minmax(0, 1fr));
      --ahtml-gallery-triptych-columns: auto minmax(0, 1fr) auto;
      --ahtml-gallery-nav-item-min-height: 2rem;
      --ahtml-gallery-nav-item-padding-inline: 0.65rem;
      --ahtml-gallery-workbench-intro-columns: minmax(0, 1.35fr) auto;
      --ahtml-gallery-workbench-copy-max-width: 44rem;
      --ahtml-gallery-workbench-header-max-width: 34rem;
      --ahtml-gallery-workbench-meta-min-width: min(100%, 22rem);
      --ahtml-gallery-workbench-side-rail-columns: minmax(13rem, 0.42fr) minmax(0, 1fr);
      --ahtml-gallery-custom-stage-secondary-min-width: 18rem;
      --ahtml-gallery-custom-card-min-width: 18rem;
      --ahtml-gallery-custom-status-columns: minmax(0, 1fr) minmax(18rem, 0.82fr);
      --ahtml-gallery-custom-stage-columns:
        minmax(0, 1.45fr)
        minmax(var(--ahtml-gallery-custom-stage-secondary-min-width), 0.75fr);
      --ahtml-gallery-dashboard-sidebar-width: 14rem;
      --ahtml-gallery-dashboard-secondary-min-width: 16rem;
      --ahtml-gallery-dashboard-lower-columns:
        minmax(0, 1.2fr)
        minmax(var(--ahtml-gallery-dashboard-secondary-min-width), 0.8fr);
      --ahtml-gallery-mail-nav-width: 13rem;
      --ahtml-gallery-mail-list-min-width: 15rem;
      --ahtml-gallery-mail-list-max-width: 18rem;
      --ahtml-gallery-mail-shell-columns:
        var(--ahtml-gallery-mail-nav-width)
        minmax(
          var(--ahtml-gallery-mail-list-min-width),
          var(--ahtml-gallery-mail-list-max-width)
        )
        minmax(0, 1fr);
      --ahtml-gallery-mail-shell-columns-medium:
        11rem
        minmax(14rem, var(--ahtml-gallery-dashboard-secondary-min-width))
        minmax(0, 1fr);
      --ahtml-gallery-pricing-lower-columns:
        minmax(0, 1.25fr)
        minmax(16rem, 0.75fr);
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
      --ahtml-gallery-custom-stat-columns: var(--ahtml-gallery-three-up-columns);
      --ahtml-gallery-custom-swatch-columns: repeat(4, minmax(0, 1fr));
      --ahtml-gallery-showcase-grid-columns: repeat(12, minmax(0, 1fr));
      --ahtml-gallery-dashboard-card-columns: repeat(4, minmax(0, 1fr));
      --ahtml-gallery-dashboard-chart-footer-columns: var(--ahtml-gallery-two-up-columns);
      --ahtml-gallery-mail-attachment-columns: var(--ahtml-gallery-two-up-columns);
      --ahtml-gallery-preset-stats-columns: repeat(4, minmax(0, 1fr));
      --ahtml-gallery-color-popover-columns: var(--ahtml-gallery-two-up-columns);
      --ahtml-gallery-inspector-columns: repeat(3, minmax(0, 1fr));
      --ahtml-gallery-dashboard-card-columns-compact: var(--ahtml-gallery-two-up-columns);
      --ahtml-gallery-inspector-columns-compact: var(--ahtml-gallery-two-up-columns);
      --ahtml-gallery-shell-surface: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      --ahtml-gallery-shell-panel: color-mix(in srgb, var(--background) 95%, var(--muted) 5%);
      --ahtml-gallery-shell-rule: color-mix(in srgb, var(--border) 78%, transparent);
      --ahtml-gallery-shell-stage: color-mix(in srgb, var(--background) 93%, var(--muted) 7%);
      --ahtml-gallery-shell-stage-glow: color-mix(in srgb, var(--foreground) 6%, transparent);
      display: grid;
      min-height: 100vh;
      grid-template-rows: auto auto 1fr;
      overflow: hidden;
      isolation: isolate;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%) 0%,
          var(--ahtml-gallery-shell-surface) 12%,
          var(--ahtml-gallery-shell-panel) 100%
        );
    }
    .ahtml-gallery-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-shell-header-gap);
      min-height: var(--ahtml-shell-toolbar-min-height);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: var(--background);
    }
    .ahtml-gallery-page-brand {
      display: flex;
      align-items: baseline;
      gap: var(--ahtml-space-sm);
      min-width: 0;
    }
    .ahtml-gallery-page-brand strong {
      font-family: var(--font-heading);
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-page-brand span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .ahtml-gallery-header-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: var(--ahtml-shell-toolbar-gap);
    }
    .ahtml-gallery-mobile-tabs {
      display: none;
      padding:
        var(--ahtml-shell-mobile-tabs-padding-top)
        var(--ahtml-shell-padding-inline)
        0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-mobile-tabs-list {
      width: 100%;
      border-radius: 0;
      justify-content: flex-start;
      gap: 0.2rem;
      padding: 0;
      background: transparent;
    }
    .ahtml-gallery-mobile-tabs-trigger {
      flex: 1;
      justify-content: center;
    }
    .ahtml-gallery-main {
      display: flex;
      min-height: 0;
      min-width: 0;
      position: relative;
      background: var(--ahtml-gallery-shell-panel);
    }
    .ahtml-gallery-workbench {
      display: flex;
      min-width: 0;
      min-height: 0;
      flex: 1;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 97%, var(--muted) 3%),
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%)
        );
    }
    .ahtml-gallery-sidebar {
      width: var(--ahtml-gallery-sidebar-width);
      min-width: var(--ahtml-gallery-sidebar-min-width);
      overflow: hidden;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%),
          color-mix(in srgb, var(--background) 95%, var(--muted) 5%)
        );
    }
    .ahtml-gallery-divider {
      width: var(--ahtml-gallery-divider-width);
      flex: none;
      border-left: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%),
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%)
        );
      cursor: col-resize;
    }
    .ahtml-gallery-sidebar-inner {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-control-header {
      display: grid;
      gap: 0;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 96%, var(--muted) 4%)
        );
    }
    .ahtml-gallery-control-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-shell-toolbar-gap);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
      flex-wrap: wrap;
      min-width: 0;
    }
    .ahtml-gallery-control-header-row + .ahtml-gallery-control-header-row {
      border-top: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    }
    .ahtml-gallery-control-header-row-tabs {
      align-items: flex-end;
    }
    .ahtml-gallery-preset-rail {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-preset-rail-gap);
      min-height: var(--ahtml-shell-toolbar-min-height);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preset-copy {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 0;
      flex: 1;
    }
    .ahtml-gallery-preset-workbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-preset-workbar-gap);
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-preset-rail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-preset-inline-gap);
      min-width: 0;
    }
    .ahtml-gallery-preset-rail-status {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-2xs);
      flex-wrap: wrap;
    }
    .ahtml-gallery-preset-inline-status {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ahtml-space-sm);
      flex-wrap: wrap;
      margin-left: auto;
    }
    .ahtml-gallery-preset-select-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
      flex-wrap: nowrap;
    }
    .ahtml-gallery-preset-popover-trigger {
      min-width: var(--ahtml-gallery-preset-trigger-min-width);
      max-width: 100%;
      height: auto;
      justify-content: flex-start;
      gap: var(--ahtml-gallery-preset-trigger-gap);
      padding: 0.45rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-preset-popover-trigger:hover {
      background: color-mix(in srgb, var(--background) 92%, var(--muted) 8%);
    }
    .ahtml-gallery-preset-trigger-copy {
      display: grid;
      min-width: 0;
      text-align: left;
      gap: 0.12rem;
      flex: 1;
    }
    .ahtml-gallery-preset-trigger-copy strong {
      line-height: 1.25;
    }
    .ahtml-gallery-preset-trigger-copy span {
      color: var(--muted-foreground);
      font-size: 0.7rem;
      line-height: 1.3;
    }
    .ahtml-gallery-preset-chevron {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-preset-swatch-row,
    .ahtml-gallery-preset-option-swatch-row {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex: none;
    }
    .ahtml-gallery-preset-swatch {
      width: 0.72rem;
      height: 0.72rem;
      border-radius: 0.28rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, white 18%, transparent);
    }
    .ahtml-gallery-preset-inline-tools {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.18rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-preset-inline-tools [data-slot="button"] {
      min-width: 2rem;
      padding-inline: 0.5rem;
      border-radius: 999px;
    }
    .ahtml-gallery-preset-select {
      min-width: var(--ahtml-gallery-preset-select-min-width);
      max-width: 100%;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      border-color: color-mix(in srgb, var(--border) 80%, transparent);
    }
    .ahtml-gallery-preset-popover {
      width: var(--ahtml-gallery-preset-popover-width);
      padding: var(--ahtml-gallery-preset-popover-padding);
      gap: var(--ahtml-gallery-preset-popover-gap);
    }
    .ahtml-gallery-preset-search-wrap {
      margin-top: 0.1rem;
    }
    .ahtml-gallery-preset-search-field {
      display: flex;
      align-items: center;
      gap: var(--ahtml-space-md);
      padding: 0.15rem 0.2rem 0.15rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 1);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preset-search-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-preset-search-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-preset-search-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-preset-popover-stats {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-preset-stats-columns);
      gap: var(--ahtml-space-xs);
    }
    .ahtml-gallery-preset-popover-stat {
      display: grid;
      gap: 0.16rem;
      padding: 0.55rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      min-width: 0;
    }
    .ahtml-gallery-preset-popover-stat span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .ahtml-gallery-preset-popover-stat strong {
      line-height: 1.35;
      word-break: break-word;
    }
    .ahtml-gallery-preset-list-scroll {
      max-height: var(--ahtml-gallery-preset-list-max-height);
    }
    .ahtml-gallery-preset-list {
      display: grid;
      gap: var(--ahtml-space-2xs);
      padding-right: 0.25rem;
    }
    .ahtml-gallery-preset-group {
      display: grid;
      gap: var(--ahtml-space-2xs);
    }
    .ahtml-gallery-preset-group + .ahtml-gallery-preset-group {
      margin-top: 0.35rem;
      padding-top: 0.55rem;
      border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-preset-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      color: var(--muted-foreground);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preset-option {
      display: flex;
      align-items: center;
      gap: var(--ahtml-space-lg);
      width: 100%;
      padding: 0.6rem 0.65rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.95);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-preset-option:hover,
    .ahtml-gallery-preset-option.is-active {
      border-color: color-mix(in srgb, var(--border) 76%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-preset-option.is-active {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-preset-option-copy {
      display: grid;
      min-width: 0;
      flex: 1;
      gap: 0.18rem;
    }
    .ahtml-gallery-preset-option-copy-top {
      display: grid;
      gap: 0.08rem;
    }
    .ahtml-gallery-preset-option-copy strong {
      line-height: 1.25;
    }
    .ahtml-gallery-preset-option-kicker {
      color: var(--muted-foreground);
      font-size: 0.76rem;
      line-height: 1.35;
    }
    .ahtml-gallery-preset-option-copy-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ahtml-space-md);
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preset-option-status {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ahtml-space-2xs);
      flex-wrap: wrap;
      flex: none;
    }
    .ahtml-gallery-preset-empty {
      padding: 0.75rem 0.2rem;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-preset-meta {
      display: grid;
      gap: var(--ahtml-space-2xs);
      min-width: 8.5rem;
      justify-items: start;
    }
    .ahtml-gallery-preset-footnote {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding:
        0.55rem
        var(--ahtml-shell-padding-inline)
        0.7rem;
      border-top: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.68rem;
      line-height: 1.35;
      min-width: 0;
    }
    .ahtml-gallery-preset-footnote span:last-child {
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }
    .ahtml-gallery-control-tabs {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
    }
    .ahtml-gallery-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--ahtml-shell-toolbar-gap);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
    }
    .ahtml-gallery-toolbar-border {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-control-body {
      min-height: 0;
      flex: 1;
      overflow: auto;
    }
    .ahtml-gallery-control-filter-bar {
      display: grid;
      gap: var(--ahtml-space-md);
      padding:
        var(--ahtml-shell-filter-padding-top)
        var(--ahtml-shell-padding-inline)
        var(--ahtml-shell-filter-padding-bottom);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    }
    .ahtml-gallery-control-filter-field {
      display: flex;
      align-items: center;
      gap: var(--ahtml-space-xs);
      min-width: 0;
      padding: 0.15rem 0.2rem 0.15rem 0.6rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-control-filter-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-control-filter-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-control-filter-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-control-filter-clear {
      flex: none;
      min-width: 1.75rem;
      padding-inline: 0.35rem;
    }
    .ahtml-gallery-control-filter-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-filter-actions {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.3rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-filter-pill {
      min-height: 1.7rem;
      border-radius: 999px;
      padding-inline: 0.55rem;
      font-size: 0.66rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-scroll {
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview {
      display: flex;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 96%, var(--muted) 4%),
          var(--ahtml-gallery-shell-stage)
        );
    }
    .ahtml-gallery-preview-toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--ahtml-space-md);
      min-width: 0;
    }
    .ahtml-gallery-toolbar-group {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-xs);
      min-width: 0;
      flex-wrap: wrap;
      padding: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-toolbar-group-label {
      padding-inline: 0.45rem 0.2rem;
      color: var(--muted-foreground);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ahtml-gallery-toolbar-group-body {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-toolbar-copy {
      display: grid;
      gap: 0.12rem;
      min-width: 0;
    }
    .ahtml-gallery-toolbar-label {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-toolbar-caption {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
      font-size: 0.76rem;
    }
    .ahtml-gallery-pill-tabs {
      width: fit-content;
      gap: 0.15rem;
      padding: 0;
      border-radius: 999px;
      background: transparent;
    }
    .ahtml-gallery-tabs-trigger-pill {
      height: auto;
      flex: none;
      border-radius: 999px;
      padding: 0.32rem 0.86rem;
      border: 1px solid transparent;
      color: color-mix(in srgb, var(--foreground) 62%, var(--muted-foreground) 38%);
      background: transparent;
      box-shadow: none;
      transition:
        background-color 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-tabs-trigger-pill:hover {
      color: var(--foreground);
      background: color-mix(in srgb, var(--muted) 68%, transparent);
    }
    .ahtml-gallery-tabs-trigger-pill[data-state="active"] {
      border-color: color-mix(in srgb, var(--border) 80%, transparent);
      background: color-mix(in srgb, var(--secondary) 84%, transparent);
      color: var(--secondary-foreground);
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--foreground) 5%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 35%, transparent);
    }
    .ahtml-gallery-pill-scroll {
      width: auto;
      max-width: 100%;
      white-space: nowrap;
    }
    .ahtml-gallery-pill-scroll [data-slot="scroll-area-viewport"] > div {
      display: inline-flex !important;
    }
    .ahtml-gallery-action-separator {
      min-height: 1.6rem;
      margin-inline: 0.15rem;
      background: color-mix(in srgb, var(--border) 74%, transparent);
    }
    .ahtml-gallery-preview-pill-scroll {
      flex: 1;
      min-width: 0;
    }
    .ahtml-gallery-preview-tabs {
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview-shell {
      display: flex;
      min-height: 0;
      height: 100%;
      flex-direction: column;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 97%, var(--muted) 3%),
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%)
        );
    }
    .ahtml-gallery-preview-shell[data-fullscreen="true"] {
      background: var(--background);
    }
    .ahtml-gallery-preview-topbar {
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap);
      padding-top: var(--ahtml-shell-preview-toolbar-padding-block);
      padding-bottom: var(--ahtml-shell-preview-toolbar-padding-block);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preview-modebar {
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap);
      padding-top: var(--ahtml-shell-preview-toolbar-padding-block);
      padding-bottom: var(--ahtml-shell-preview-toolbar-padding-block);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-preview-mode-tools {
      display: flex;
      align-items: center;
      gap: var(--ahtml-gallery-preview-mode-tools-gap);
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-more-previews,
    .ahtml-gallery-inspector-button {
      border-radius: 999px;
    }
    .ahtml-gallery-preview-toolbar [data-slot="button"] {
      border-radius: 999px;
    }
    .ahtml-gallery-toolbar-group [data-slot="button"] {
      border-radius: 999px;
    }
    .ahtml-gallery-segmented-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-toggle-button {
      min-width: 4.25rem;
      border-radius: 999px;
    }
    .ahtml-gallery-preset-theme-toggle {
      justify-content: space-between;
    }
    .ahtml-gallery-preview-stage {
      display: flex;
      min-height: 0;
      flex: 1;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--muted) 20%, transparent),
          transparent 20%
        );
    }
    .ahtml-gallery-stage-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-stage-toolbar-gap);
      flex-wrap: wrap;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-stage-toolbar-inset {
      padding:
        var(--ahtml-shell-stage-toolbar-padding-block)
        var(--ahtml-shell-padding-inline);
      margin: -1rem -1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-stage-toolbar-meta {
      display: flex;
      align-items: center;
      gap: var(--ahtml-space-md);
      flex-wrap: wrap;
      min-width: 0;
    }
    .ahtml-gallery-control-empty {
      padding: 1rem;
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .ahtml-gallery-tab-panel {
      margin-top: 0;
      height: 100%;
    }
    .ahtml-gallery-control-sections {
      display: grid;
      gap: 0;
      padding:
        0
        var(--ahtml-shell-section-padding-inline)
        var(--ahtml-shell-section-padding-bottom);
    }
    .ahtml-gallery-control-sections [data-slot="accordion-item"] {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      padding: 0.12rem 0;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] {
      width: fit-content;
      padding: 0.08rem 0;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      text-decoration: none;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] > span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border-radius: calc(var(--radius) * 0.72);
      border: 1px solid transparent;
      background: color-mix(in srgb, var(--muted) 62%, transparent);
      padding: 0.22rem 0.5rem;
      transition:
        border-color 160ms ease,
        background-color 160ms ease,
        color 160ms ease;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"]:hover > span {
      border-color: color-mix(in srgb, var(--border) 74%, transparent);
      background: color-mix(in srgb, var(--muted) 78%, transparent);
      color: var(--foreground);
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"][data-state="open"] > span {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 84%, transparent);
      color: var(--foreground);
      box-shadow: inset 0 1px 0 color-mix(in srgb, white 25%, transparent);
    }
    .ahtml-gallery-panel-body {
      padding: 0.14rem 0 0.48rem;
    }
    .ahtml-gallery-stack {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
    }
    .ahtml-gallery-control-row,
    .ahtml-gallery-field-row {
      display: grid;
      grid-template-columns: minmax(0, 5.4rem) minmax(0, 1fr);
      align-items: center;
      gap: 0.48rem;
      padding: 0.12rem 0;
    }
    .ahtml-gallery-control-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
      padding-top: 0;
    }
    .ahtml-gallery-control-label {
      font-size: 0.72rem;
      line-height: 1.35;
    }
    .ahtml-gallery-control-description {
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.72rem;
      line-height: 1.42;
    }
    .ahtml-gallery-control-input-wrap {
      min-width: 0;
    }
    .ahtml-gallery-control-input {
      min-height: 2rem;
    }
    .ahtml-gallery-control-input-mono,
    .ahtml-gallery-control-readout {
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.74rem;
    }
    .ahtml-gallery-control-value {
      min-width: 0;
      text-align: left;
    }
    .ahtml-gallery-control-readout {
      display: inline-block;
      line-height: 1.5;
      word-break: break-word;
    }
    .ahtml-gallery-wrap {
      white-space: normal;
    }
    .ahtml-gallery-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-error {
      color: hsl(0 72% 50%);
    }
    .ahtml-gallery-slider-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.65rem;
      min-width: 0;
    }
    .ahtml-gallery-slider-control {
      min-width: 0;
    }
    .ahtml-gallery-slider-input-wrap {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-2xs);
    }
    .ahtml-gallery-slider-input-wrap [data-slot="input"] {
      width: 5rem;
    }
    .ahtml-gallery-slider-unit {
      color: var(--muted-foreground);
      font-size: 0.72rem;
    }
    .ahtml-gallery-control-row-focused,
    .ahtml-gallery-font-field.is-focused,
    .ahtml-gallery-token-row.is-focused {
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-font-field {
      display: grid;
      gap: 0.28rem;
      padding: 0.18rem 0.2rem;
      margin-inline: -0.2rem;
    }
    .ahtml-gallery-font-picker-row {
      align-items: start;
    }
    .ahtml-gallery-font-picker-trigger {
      width: 100%;
      min-height: 2.2rem;
      justify-content: space-between;
    }
    .ahtml-gallery-font-picker-trigger-copy {
      display: grid;
      justify-items: start;
      text-align: left;
      min-width: 0;
    }
    .ahtml-gallery-font-picker-trigger-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
    }
    .ahtml-gallery-font-picker-popover {
      width: min(24rem, calc(100vw - 2rem));
      padding: 0.75rem;
    }
    .ahtml-gallery-font-picker-search {
      position: relative;
      margin-top: 0.5rem;
    }
    .ahtml-gallery-font-picker-search-icon {
      position: absolute;
      top: 50%;
      left: 0.7rem;
      width: 0.85rem;
      height: 0.85rem;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .ahtml-gallery-font-picker-search-input {
      padding-left: 2rem;
    }
    .ahtml-gallery-font-picker-list-scroll {
      max-height: 16rem;
      margin-top: 0.55rem;
    }
    .ahtml-gallery-font-picker-list {
      display: grid;
      gap: 0.3rem;
      padding-right: 0.2rem;
    }
    .ahtml-gallery-font-picker-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      padding: 0.6rem 0.7rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.9);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .ahtml-gallery-font-picker-option:hover,
    .ahtml-gallery-font-picker-option.is-active {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-font-picker-option-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
    }
    .ahtml-gallery-font-picker-option-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
    }
    .ahtml-gallery-font-picker-empty {
      padding: 0.75rem 0.15rem;
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.4;
    }
    .ahtml-gallery-token-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(8.5rem, 0.9fr);
      align-items: center;
      gap: var(--ahtml-space-md);
      padding: 0.18rem 0.2rem;
      margin-inline: -0.2rem;
    }
    .ahtml-gallery-token-meta {
      display: flex;
      align-items: center;
      gap: var(--ahtml-space-md);
      min-width: 0;
    }
    .ahtml-gallery-token-copy {
      display: grid;
      min-width: 0;
    }
    .ahtml-gallery-token-copy strong {
      font-size: 0.74rem;
      line-height: 1.35;
    }
    .ahtml-gallery-token-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      line-height: 1.35;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }
    .ahtml-gallery-color-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.8);
      background: transparent;
      cursor: pointer;
    }
    .ahtml-gallery-swatch {
      width: 1.15rem;
      height: 1.15rem;
      border-radius: 0.35rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-token-input-wrap {
      min-width: 0;
    }
    .ahtml-gallery-token-input {
      width: 100%;
    }
    .ahtml-gallery-color-popover {
      width: min(22rem, calc(100vw - 2rem));
      padding: 0.75rem;
    }
    .ahtml-gallery-color-popover-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-color-popover-columns);
      gap: var(--ahtml-space-xs);
      margin-top: 0.5rem;
    }
    .ahtml-gallery-color-suggestion {
      display: flex;
      align-items: center;
      gap: var(--ahtml-space-xs);
      padding: 0.45rem 0.55rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      cursor: pointer;
      text-align: left;
    }
    .ahtml-gallery-color-suggestion-swatch {
      width: 1rem;
      height: 1rem;
      border-radius: 0.3rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      flex: none;
    }
    .ahtml-gallery-color-popover-input-wrap {
      margin-top: 0.65rem;
    }
    .ahtml-gallery-preview-meta {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
      padding: 0.5rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-preview-meta span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-meta strong {
      font-size: 0.76rem;
      line-height: 1.45;
      word-break: break-word;
    }
    .ahtml-gallery-stage-frame {
      min-height: 100%;
      border: 0;
      border-radius: 0;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%),
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%)
        );
      box-sizing: border-box;
      padding:
        var(--ahtml-gallery-stage-frame-padding-top)
        var(--ahtml-gallery-stage-frame-padding-inline)
        var(--ahtml-gallery-stage-frame-padding-bottom);
    }
    .ahtml-gallery-stage-frame-components,
    .ahtml-gallery-stage-frame-full,
    .ahtml-gallery-stage-frame-custom,
    .ahtml-gallery-stage-frame-dashboard {
      padding-top: var(--ahtml-gallery-stage-frame-mode-padding-top);
    }
    .ahtml-gallery-stage-frame-mail {
      padding-top: var(--ahtml-gallery-stage-frame-mode-padding-top);
    }
    .ahtml-gallery-stage-frame-forms,
    .ahtml-gallery-stage-frame-colors,
    .ahtml-gallery-stage-frame-disclosure,
    .ahtml-gallery-stage-frame-typography {
      display: grid;
      align-items: start;
      justify-items: center;
    }
    .ahtml-gallery-stage-frame-custom,
    .ahtml-gallery-stage-frame-components,
    .ahtml-gallery-stage-frame-dashboard,
    .ahtml-gallery-stage-frame-mail {
      padding-left: var(--ahtml-gallery-stage-frame-mode-padding-inline);
      padding-right: var(--ahtml-gallery-stage-frame-mode-padding-inline);
    }
    .ahtml-gallery-preview-surface {
      position: relative;
      min-height: 100%;
      overflow: clip;
      border: 1px solid color-mix(in srgb, var(--border) 66%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
      box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 38%, transparent),
        0 1px 2px color-mix(in srgb, var(--foreground) 4%, transparent),
        var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread)
          color-mix(in srgb, var(--shadow-color) calc(var(--shadow-opacity) * 100%), transparent),
        0 18px 42px var(--ahtml-gallery-shell-stage-glow);
      color: var(--foreground);
      box-sizing: border-box;
    }
    .ahtml-gallery-stage-frame-custom .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-components .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-dashboard .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-mail .ahtml-gallery-preview-surface {
      border-radius: calc(var(--radius) * 0.95);
      box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 34%, transparent),
        0 1px 2px color-mix(in srgb, var(--foreground) 3%, transparent),
        var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread)
          color-mix(in srgb, var(--shadow-color) calc(var(--shadow-opacity) * 100%), transparent),
        0 12px 30px color-mix(in srgb, var(--foreground) 5%, transparent);
    }
    .ahtml-gallery-preview-surface[data-inspector="true"] {
      cursor: crosshair;
    }
    .ahtml-gallery-preview-surface-inner {
      min-height: 100%;
      padding: var(--ahtml-gallery-preview-surface-inner-padding);
      box-sizing: border-box;
    }
    .ahtml-gallery-inspector-overlay {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      justify-content: flex-end;
      pointer-events: none;
      padding:
        var(--ahtml-gallery-inspector-overlay-padding-top)
        var(--ahtml-gallery-inspector-overlay-padding-inline)
        0;
    }
    .ahtml-gallery-inspector-outline {
      position: absolute;
      border: 1px solid color-mix(in srgb, var(--ring) 82%, white 18%);
      border-radius: calc(var(--radius) * 0.9);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--background) 92%, transparent),
        0 0 0 4px color-mix(in srgb, var(--ring) 18%, transparent);
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      transition:
        top 120ms ease,
        left 120ms ease,
        width 120ms ease,
        height 120ms ease;
    }
    .ahtml-gallery-inspector-outline-label {
      position: absolute;
      top: -0.65rem;
      left: 0.55rem;
      padding: 0.16rem 0.45rem;
      border-radius: 999px;
      background: var(--foreground);
      color: var(--background);
      font-size: 0.67rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ahtml-gallery-inspector-panel {
      display: grid;
      gap: 0.18rem;
      min-width: 13rem;
      max-width: var(--ahtml-gallery-inspector-panel-max-width);
      pointer-events: auto;
      padding:
        var(--ahtml-gallery-compact-panel-padding-block)
        var(--ahtml-gallery-compact-panel-padding-inline);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--popover) 94%, transparent);
      color: var(--popover-foreground);
      box-shadow: 0 12px 40px color-mix(in srgb, var(--foreground) 12%, transparent);
      backdrop-filter: blur(12px);
    }
    .ahtml-gallery-inspector-kicker {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-inspector-panel strong {
      line-height: 1.2;
    }
    .ahtml-gallery-inspector-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-inspector-columns);
      gap: var(--ahtml-space-xs);
      margin-top: 0.35rem;
    }
    .ahtml-gallery-inspector-panel span:last-child {
      color: color-mix(in srgb, var(--popover-foreground) 74%, var(--muted-foreground) 26%);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-inspector-token-group {
      display: grid;
      gap: 0.3rem;
      margin-top: 0.4rem;
    }
    .ahtml-gallery-inspector-token-label {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-inspector-token-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ahtml-space-2xs);
    }
    .ahtml-gallery-inspector-token {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.7rem;
      padding: 0.2rem 0.48rem;
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 42%, transparent);
      appearance: none;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.72rem;
      font-weight: 500;
      line-height: 1.2;
      color: var(--popover-foreground);
      word-break: break-word;
      text-align: left;
    }
    .ahtml-gallery-inspector-token.is-action {
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-inspector-token.is-action:hover {
      border-color: color-mix(in srgb, var(--ring) 54%, transparent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }
    .ahtml-gallery-inspector-token.is-focused {
      border-color: color-mix(in srgb, var(--ring) 68%, transparent);
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 16%, transparent);
    }
    .ahtml-gallery-inspector-hint {
      margin-top: 0.35rem;
    }
    .ahtml-gallery-stage-frame-components .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-mail .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-full .ahtml-gallery-preview-surface {
      width: 100%;
    }
    .ahtml-gallery-stage-frame-custom .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-dashboard .ahtml-gallery-preview-surface {
      width: 100%;
    }
    .ahtml-gallery-stage-frame-forms .ahtml-gallery-preview-surface {
      width: min(100%, 58rem);
    }
    .ahtml-gallery-stage-frame-colors .ahtml-gallery-preview-surface {
      width: min(100%, 72rem);
    }
    .ahtml-gallery-stage-frame-disclosure .ahtml-gallery-preview-surface {
      width: min(100%, 62rem);
    }
    .ahtml-gallery-stage-frame-typography .ahtml-gallery-preview-surface {
      width: min(100%, 70rem);
    }
    .ahtml-gallery-preview-context {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ahtml-space-xs);
      min-width: 0;
      flex-wrap: wrap;
      color: var(--muted-foreground);
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-context span {
      color: var(--muted-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-preview-context strong {
      color: var(--foreground);
      font-size: 0.72rem;
      line-height: 1;
      letter-spacing: 0;
      text-transform: none;
    }
    .ahtml-gallery-section-kicker {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-title {
      margin: 0;
      font-family: var(--font-heading);
      letter-spacing: -0.04em;
      font-size: 1rem;
      line-height: 1.2;
    }
    .ahtml-gallery-meta,
    .ahtml-gallery-preview-note {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-section-note {
      margin: 0 0 0.2rem;
      color: color-mix(in srgb, var(--muted-foreground) 82%, transparent);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .ahtml-gallery-preview-document {
      width: 100%;
      padding: 0;
      min-height: auto;
      align-content: start;
    }
    .ahtml-gallery-preview-document .ahtml-prose-block {
      max-width: 68ch;
    }
    .ahtml-gallery-preview-document .ahtml-prose-block > p {
      line-height: 1.75;
    }
    .ahtml-gallery-preview-document .ahtml-prose-inline {
      line-height: 1.65;
    }
    .ahtml-gallery-preview-document .ahtml-section-stack {
      display: grid;
      gap: 1.35rem;
    }
    .ahtml-gallery-preview-document [data-slot="card-content"].ahtml-section-stack > :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) + :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) {
      margin-top: 0;
    }
    .ahtml-gallery-stage-panel {
      display: grid;
      gap: var(--ahtml-gallery-stage-panel-gap);
      width: min(100%, 72rem);
      padding: 0.25rem;
    }
    .ahtml-gallery-stage-toolbar-copy {
      display: grid;
      gap: 0.12rem;
      min-width: 0;
    }
    .ahtml-gallery-stage-toolbar-copy strong {
      font-size: 0.92rem;
      line-height: 1.35;
      letter-spacing: -0.01em;
    }
    .ahtml-gallery-stage-panel-header {
      display: grid;
      gap: 0.2rem;
      max-width: 44rem;
    }
    .ahtml-gallery-stage-panel-header h3 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .ahtml-gallery-stage-panel-header p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-stage-panel-kicker {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-panel {
      max-width: var(--ahtml-gallery-panel-max-width-reading);
    }
    .ahtml-gallery-color-panel {
      width: min(100%, var(--ahtml-gallery-panel-max-width));
    }
    .ahtml-gallery-custom-panel {
      width: min(100%, var(--ahtml-gallery-panel-max-width));
    }
    .ahtml-gallery-workbench-panel {
      width: min(100%, var(--ahtml-gallery-panel-max-width-wide));
    }
    .ahtml-gallery-preview-canvas {
      min-height: 0;
      flex: 1;
      overflow: auto;
      padding: 0;
    }
    .ahtml-gallery-preview-panel {
      margin: 0;
      min-height: 100%;
    }
    @media (max-width: 1180px) {
      .ahtml-gallery-shell {
        --ahtml-gallery-dashboard-card-columns: var(--ahtml-gallery-dashboard-card-columns-compact);
      }
      .ahtml-gallery-preview-context {
        display: none;
      }
    }
    @media (max-width: 960px) {
      .ahtml-gallery-mobile-tabs {
        display: block;
      }
      .ahtml-gallery-divider {
        display: none;
      }
      .ahtml-gallery-main,
      .ahtml-gallery-workbench,
      .ahtml-gallery-sidebar,
      .ahtml-gallery-preview {
        min-width: 0;
      }
      .ahtml-gallery-sidebar,
      .ahtml-gallery-preview {
        width: 100%;
        min-width: 0;
      }
      .ahtml-gallery-sidebar[data-mobile-panel="hidden"],
      .ahtml-gallery-preview[data-mobile-panel="hidden"] {
        display: none;
      }
      .ahtml-gallery-sidebar[data-mobile-panel="active"],
      .ahtml-gallery-preview[data-mobile-panel="active"] {
        display: block;
      }
    }
    @media (max-width: 720px) {
      .ahtml-gallery-shell {
        --ahtml-gallery-preset-stats-columns: 1fr;
        --ahtml-gallery-inspector-columns: var(--ahtml-gallery-inspector-columns-compact);
      }
      .ahtml-gallery-page-header,
      .ahtml-gallery-toolbar,
      .ahtml-gallery-control-header-row,
      .ahtml-gallery-stage-toolbar-inset {
        padding-left: var(--ahtml-shell-padding-inline);
        padding-right: var(--ahtml-shell-padding-inline);
      }
      .ahtml-gallery-preview-toolbar,
      .ahtml-gallery-preview-mode-tools {
        align-items: stretch;
      }
      .ahtml-gallery-toolbar-group,
      .ahtml-gallery-segmented-toggle {
        width: 100%;
      }
      .ahtml-gallery-control-sections {
        padding-left: var(--ahtml-shell-section-padding-inline);
        padding-right: var(--ahtml-shell-section-padding-inline);
      }
      .ahtml-gallery-control-row,
      .ahtml-gallery-field-row {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-slider-field {
        gap: var(--ahtml-space-xs);
      }
    }
  `
}
