export function createGalleryDashboardWorkbenchCss() {
  return `
    .ahtml-gallery-dashboard-shell {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-sidebar-width) minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--background);
    }
    .ahtml-gallery-dashboard-sidebar {
      display: grid;
      align-content: start;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-layout-block-padding);
      border-right: 1px solid var(--border);
      background: var(--muted);
    }
    .ahtml-gallery-dashboard-sidebar-top,
    .ahtml-gallery-dashboard-nav-section,
    .ahtml-gallery-dashboard-sidebar-status {
      display: grid;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-dashboard-sidebar-top p {
      margin: 0;
      color: color-mix(in srgb, var(--sidebar-foreground) 74%, transparent);
      font-size: var(--ahtml-gallery-text-body-size);
      line-height: 1.5;
    }
    .ahtml-gallery-dashboard-nav-label {
      color: color-mix(in srgb, var(--sidebar-foreground) 68%, transparent);
      font-size: var(--ahtml-gallery-text-label-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-kicker);
      text-transform: uppercase;
    }
    .ahtml-gallery-dashboard-nav-group {
      display: grid;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-dashboard-sidebar span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-supporting-size);
    }
    .ahtml-gallery-dashboard-nav-group span {
      display: flex;
      align-items: center;
      min-height: var(--ahtml-gallery-nav-item-min-height);
      padding: 0 var(--ahtml-gallery-nav-item-padding-inline);
      border-radius: var(--radius);
      background: var(--background);
    }
    .ahtml-gallery-dashboard-nav-group span.is-active {
      color: var(--foreground);
      font-weight: 700;
      background: var(--accent);
    }
    .ahtml-gallery-dashboard-main {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      padding:
        0
        var(--ahtml-gallery-layout-inline-padding)
        var(--ahtml-gallery-layout-block-padding);
    }
    .ahtml-gallery-dashboard-utility-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap);
      padding: var(--ahtml-gallery-compact-panel-padding-block) 0;
      border-top: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      flex-wrap: wrap;
    }
    .ahtml-gallery-dashboard-utility-copy {
      display: grid;
      gap: var(--ahtml-gallery-copy-stack-gap-tight);
    }
    .ahtml-gallery-dashboard-utility-copy p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-supporting-size);
      line-height: 1.5;
    }
    .ahtml-gallery-dashboard-section-cards {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-card-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-metric-card {
      height: 100%;
      border-color: var(--border);
      background: var(--card);
    }
    .ahtml-gallery-dashboard-metric-content {
      display: grid;
      gap: var(--ahtml-space-xs);
    }
    .ahtml-gallery-dashboard-metric-content span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-meta-size);
      line-height: 1.45;
    }
    .ahtml-gallery-chart-bars {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-chart-columns);
      align-items: end;
      gap: var(--ahtml-space-sm);
      min-height: 14rem;
    }
    .ahtml-gallery-chart-bars span {
      border-radius: calc(var(--radius) * 0.75) calc(var(--radius) * 0.75) 0 0;
      box-shadow: none;
    }
    .ahtml-gallery-dashboard-lower {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-lower-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-table-footer {
      grid-template-columns: var(--ahtml-gallery-two-up-columns);
      margin-top: var(--ahtml-gallery-summary-grid-margin-top);
    }
    .ahtml-gallery-dashboard-chart-footer {
      grid-template-columns: var(--ahtml-gallery-dashboard-chart-footer-columns);
      margin-top: var(--ahtml-gallery-summary-grid-margin-top);
    }
    .ahtml-gallery-dashboard-mix-card {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-leading-detail-columns);
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-dashboard-donut {
      width: 7rem;
      height: 7rem;
      border-radius: var(--ahtml-gallery-radius-full);
      position: relative;
    }
    .ahtml-gallery-dashboard-donut::after {
      content: "";
      position: absolute;
      inset: 1.25rem;
      border-radius: var(--ahtml-gallery-radius-full);
      background: var(--card);
      border: 1px solid var(--border);
    }
    .ahtml-gallery-dashboard-mix-list {
      display: grid;
      gap: var(--ahtml-space-xs);
      min-width: 0;
    }
  `
}
