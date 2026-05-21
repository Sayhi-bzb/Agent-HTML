export function createGalleryDashboardWorkbenchCss() {
  return `
    .ahtml-gallery-dashboard-shell {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-sidebar-width) minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
    }
    .ahtml-gallery-dashboard-sidebar {
      display: grid;
      align-content: start;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-layout-block-padding);
      border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 42%, transparent);
    }
    .ahtml-gallery-dashboard-nav-group {
      display: grid;
      gap: var(--ahtml-space-md);
    }
    .ahtml-gallery-dashboard-sidebar span {
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-dashboard-nav-group span.is-active {
      color: var(--sidebar-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-dashboard-main {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      padding:
        0
        var(--ahtml-gallery-layout-inline-padding)
        var(--ahtml-gallery-layout-block-padding);
    }
    .ahtml-gallery-dashboard-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap);
      flex-wrap: wrap;
    }
    .ahtml-gallery-dashboard-header h4 {
      margin: 0.12rem 0 0;
      font-size: 1.3rem;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-dashboard-section-cards {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-card-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-chart-bars {
      display: grid;
      grid-template-columns: repeat(8, minmax(0, 1fr));
      align-items: end;
      gap: var(--ahtml-space-sm);
      min-height: 14rem;
    }
    .ahtml-gallery-chart-bars span {
      border-radius: calc(var(--radius) * 0.75) calc(var(--radius) * 0.75) 0 0;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, white 15%, transparent);
    }
    .ahtml-gallery-dashboard-lower {
      display: grid;
      grid-template-columns:
        minmax(0, 1.2fr)
        minmax(var(--ahtml-gallery-dashboard-secondary-min-width), 0.8fr);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-secondary-stack {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-chart-footer {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-chart-footer-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
      margin-top: 0.9rem;
    }
    .ahtml-gallery-dashboard-mix-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-dashboard-donut {
      width: 7rem;
      height: 7rem;
      border-radius: 999px;
      position: relative;
    }
    .ahtml-gallery-dashboard-donut::after {
      content: "";
      position: absolute;
      inset: 1.25rem;
      border-radius: 999px;
      background: var(--card);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-dashboard-mix-list {
      display: grid;
      gap: var(--ahtml-space-xs);
      min-width: 0;
    }
  `
}
