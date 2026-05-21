export function createGalleryColorsWorkbenchCss() {
  return `
    .ahtml-gallery-color-content {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-color-hero {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-auto-fit-color-hero-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-color-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-auto-fit-color-grid-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-color-mode-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-auto-fit-color-mode-columns);
      gap: var(--ahtml-gallery-content-card-padding-relaxed);
    }
    .ahtml-gallery-color-mode-panel {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      padding: var(--ahtml-gallery-content-card-padding-relaxed);
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-color-mode-panel.is-active {
      border-color: color-mix(in srgb, var(--ring) 58%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-color-mode-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      flex-wrap: wrap;
    }
    .ahtml-gallery-color-mode-copy {
      display: grid;
      gap: var(--ahtml-gallery-copy-stack-gap-tight);
    }
    .ahtml-gallery-color-mode-copy span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-kicker-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-kicker-wide);
      text-transform: uppercase;
    }
    .ahtml-gallery-color-mode-copy strong {
      font-size: var(--ahtml-gallery-text-strong-size);
      line-height: 1.3;
    }
    .ahtml-gallery-color-card {
      display: grid;
      gap: var(--ahtml-space-lg);
      width: 100%;
      padding: var(--ahtml-gallery-content-card-padding-relaxed);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-color-card:hover {
      border-color: color-mix(in srgb, var(--border) 82%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-color-card-swatch {
      display: block;
      width: 100%;
      min-height: 4.25rem;
      border-radius: calc(var(--radius) * 0.9);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-color-card-copy {
      display: grid;
      gap: var(--ahtml-gallery-copy-stack-gap-tight);
    }
    .ahtml-gallery-color-card-copy span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-label-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-kicker);
      text-transform: uppercase;
    }
    .ahtml-gallery-color-card-copy strong {
      font-family: monospace;
      font-size: var(--ahtml-gallery-text-strong-size);
      line-height: 1.45;
      word-break: break-word;
    }
    .ahtml-gallery-color-card-action {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-label-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-kicker);
      text-transform: uppercase;
    }
  `
}
