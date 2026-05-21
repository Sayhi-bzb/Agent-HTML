export function createGalleryTypographyWorkbenchCss() {
  return `
    .ahtml-gallery-typography-content {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-typography-sample-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-auto-fit-typography-sample-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-typography-sample {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-content-card-padding);
    }
    .ahtml-gallery-typography-sample h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3rem);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-typography-body-card {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-content-card-padding);
    }
    .ahtml-gallery-typography-body-copy {
      margin: 0;
      font-size: var(--ahtml-gallery-text-body-size);
      line-height: 1.65;
      color: var(--foreground);
    }
    .ahtml-gallery-typography-note-stack {
      display: grid;
      gap: var(--ahtml-space-lg);
    }
    .ahtml-gallery-typography-note-stack p {
      margin: 0;
      font-size: var(--ahtml-gallery-text-supporting-size);
      line-height: 1.55;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-chip {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding:
        var(--ahtml-gallery-pill-padding-block)
        var(--ahtml-gallery-pill-padding-inline);
      font-size: var(--ahtml-gallery-text-chip-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-chip);
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-kicker {
      margin: 0;
      font-size: var(--ahtml-gallery-text-chip-size);
      font-weight: 600;
      letter-spacing: var(--ahtml-gallery-tracking-kicker);
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-auto-fit-typography-token-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-typography-token {
      display: grid;
      gap: var(--ahtml-space-sm);
      padding: var(--ahtml-gallery-content-card-padding);
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--muted) 56%, transparent);
      font-family: monospace;
      font-size: var(--ahtml-gallery-text-strong-size);
    }
  `
}
