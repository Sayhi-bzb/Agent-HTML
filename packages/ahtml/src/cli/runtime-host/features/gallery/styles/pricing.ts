export function createGalleryPricingWorkbenchCss() {
  return `
    .ahtml-gallery-pricing-shell {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-pricing-header {
      display: grid;
      gap: var(--ahtml-space-md);
      justify-items: start;
    }
    .ahtml-gallery-pricing-header h4 {
      margin: 0.12rem 0 0;
      font-size: 1.3rem;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-pricing-header p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
    }
    .ahtml-gallery-pricing-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.4rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      color: var(--muted-foreground);
      font-size: 0.78rem;
    }
    .ahtml-gallery-pricing-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-pricing-columns);
      gap: 0.85rem;
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
      font-size: 0.82rem;
    }
  `
}
