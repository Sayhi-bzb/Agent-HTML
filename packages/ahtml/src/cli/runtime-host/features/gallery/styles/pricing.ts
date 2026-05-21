export function createGalleryPricingWorkbenchCss() {
  return `
    .ahtml-gallery-pricing-shell {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-pricing-browser {
      display: grid;
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 10%, transparent), transparent 30%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 99%, var(--muted) 1%), color-mix(in srgb, var(--background) 95%, var(--muted) 5%));
    }
    .ahtml-gallery-pricing-utility-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap);
      padding:
        var(--ahtml-gallery-tight-toolbar-padding-block)
        var(--ahtml-gallery-layout-inline-padding)
        var(--ahtml-gallery-layout-block-padding);
      border-top: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      flex-wrap: wrap;
    }
    .ahtml-gallery-pricing-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-md);
      padding:
        var(--ahtml-gallery-pill-padding-block)
        var(--ahtml-gallery-pill-padding-inline);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: var(--ahtml-gallery-radius-full);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-meta-size);
    }
    .ahtml-gallery-pricing-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-showcase-grid-columns);
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-pricing-card {
      grid-column: span 4;
      min-width: 0;
      height: 100%;
      border-color: color-mix(in srgb, var(--border) 70%, transparent);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 96%, var(--muted) 4%)
        );
    }
    .ahtml-gallery-pricing-card-feature {
      transform: translateY(calc(var(--ahtml-space-sm) * -1));
      background:
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--card) 97%, white 3%),
          color-mix(in srgb, var(--accent) 10%, var(--card) 90%)
        );
      box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 38%, transparent),
        0 16px 34px color-mix(in srgb, var(--foreground) 6%, transparent);
    }
    .ahtml-gallery-pricing-lower {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-pricing-lower-columns);
      gap: var(--ahtml-gallery-layout-gap);
      align-items: start;
    }
    .ahtml-gallery-pricing-comparison {
      display: grid;
      gap: 0;
    }
    .ahtml-gallery-pricing-comparison-row {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-pricing-comparison-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
      align-items: center;
      padding: var(--ahtml-gallery-compact-panel-padding-block) 0;
      border-top: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      font-size: var(--ahtml-gallery-text-supporting-size);
    }
    .ahtml-gallery-pricing-comparison-row:first-child {
      border-top: 0;
      padding-top: 0;
    }
    .ahtml-gallery-pricing-comparison-row.is-head {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-chip-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-chip);
      text-transform: uppercase;
    }
    .ahtml-gallery-feature-list {
      display: grid;
      gap: var(--ahtml-space-md);
    }
    .ahtml-gallery-feature-list label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      font-size: var(--ahtml-gallery-text-supporting-size);
    }
  `
}
