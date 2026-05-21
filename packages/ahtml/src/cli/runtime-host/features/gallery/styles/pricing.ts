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
    .ahtml-gallery-pricing-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap);
      flex-wrap: wrap;
    }
    .ahtml-gallery-pricing-header-copy {
      display: grid;
      gap: var(--ahtml-space-2xs);
      max-width: var(--ahtml-gallery-workbench-header-max-width);
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
      gap: 0.6rem;
      padding: 0.4rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      color: var(--muted-foreground);
      font-size: 0.78rem;
    }
    .ahtml-gallery-pricing-overview {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-workbench-intro-columns);
      gap: var(--ahtml-gallery-layout-gap);
      align-items: end;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-pricing-overview-copy {
      display: grid;
      gap: var(--ahtml-space-2xs);
      max-width: var(--ahtml-gallery-workbench-copy-max-width);
    }
    .ahtml-gallery-pricing-overview-copy h3 {
      margin: 0;
      font-size: clamp(1.15rem, 2.2vw, 1.6rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-pricing-overview-copy p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.6;
    }
    .ahtml-gallery-pricing-overview-meta {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-three-up-columns);
      gap: var(--ahtml-space-xs);
      min-width: var(--ahtml-gallery-workbench-meta-min-width);
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
      grid-template-columns: minmax(0, 1.2fr) repeat(3, minmax(0, 0.7fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
      align-items: center;
      padding: 0.7rem 0;
      border-top: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      font-size: 0.82rem;
    }
    .ahtml-gallery-pricing-comparison-row:first-child {
      border-top: 0;
      padding-top: 0;
    }
    .ahtml-gallery-pricing-comparison-row.is-head {
      color: var(--muted-foreground);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-pricing-side-stack {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-pricing-checklist {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-pricing-checklist div {
      display: grid;
      gap: 0.18rem;
      padding: var(--ahtml-surface-padding-sm);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--muted) 42%, transparent);
    }
    .ahtml-gallery-pricing-checklist span {
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.45;
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
