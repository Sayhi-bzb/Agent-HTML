export function createGalleryDashboardWorkbenchCss() {
  return `
    .ahtml-gallery-dashboard-shell {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-sidebar-width) minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 10%, transparent), transparent 32%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 99%, var(--muted) 1%), color-mix(in srgb, var(--background) 95%, var(--muted) 5%));
    }
    .ahtml-gallery-dashboard-sidebar {
      display: grid;
      align-content: start;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-layout-block-padding);
      border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 42%, transparent);
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
      font-size: 0.8rem;
      line-height: 1.5;
    }
    .ahtml-gallery-dashboard-nav-label {
      color: color-mix(in srgb, var(--sidebar-foreground) 68%, transparent);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-dashboard-nav-group {
      display: grid;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-dashboard-sidebar span {
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-dashboard-nav-group span {
      display: flex;
      align-items: center;
      min-height: var(--ahtml-gallery-nav-item-min-height);
      padding: 0 var(--ahtml-gallery-nav-item-padding-inline);
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, white 6%, transparent);
    }
    .ahtml-gallery-dashboard-nav-group span.is-active {
      color: var(--sidebar-foreground);
      font-weight: 700;
      background: color-mix(in srgb, var(--sidebar-primary) 22%, transparent);
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
    .ahtml-gallery-dashboard-header-copy {
      display: grid;
      gap: var(--ahtml-space-2xs);
      max-width: var(--ahtml-gallery-workbench-header-max-width);
    }
    .ahtml-gallery-dashboard-header h4 {
      margin: 0.12rem 0 0;
      font-size: 1.3rem;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-dashboard-header p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
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
      gap: 0.2rem;
    }
    .ahtml-gallery-dashboard-utility-copy p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.5;
    }
    .ahtml-gallery-dashboard-section-cards {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-card-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-metric-card {
      height: 100%;
      border-color: color-mix(in srgb, var(--border) 70%, transparent);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 96%, var(--muted) 4%)
        );
    }
    .ahtml-gallery-dashboard-metric-content {
      display: grid;
      gap: var(--ahtml-space-xs);
    }
    .ahtml-gallery-dashboard-metric-content span {
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.45;
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
      grid-template-columns: var(--ahtml-gallery-dashboard-lower-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-secondary-stack {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-table-footer {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-two-up-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
      margin-top: 0.9rem;
    }
    .ahtml-gallery-dashboard-chart-footer {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-dashboard-chart-footer-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
      margin-top: 0.9rem;
    }
    .ahtml-gallery-dashboard-checklist {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-dashboard-checklist div {
      display: grid;
      gap: 0.18rem;
      padding: var(--ahtml-surface-padding-sm);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--muted) 42%, transparent);
    }
    .ahtml-gallery-dashboard-checklist span {
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.45;
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
