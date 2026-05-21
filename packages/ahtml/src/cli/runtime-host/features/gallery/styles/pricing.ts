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
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--background);
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
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--background);
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
      border-color: var(--border);
      background: var(--card);
    }
    .ahtml-gallery-pricing-card-feature {
      transform: none;
      background: var(--card);
      box-shadow: none;
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
