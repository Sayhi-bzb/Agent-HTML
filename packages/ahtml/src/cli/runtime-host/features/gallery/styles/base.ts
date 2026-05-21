export function createGalleryWorkbenchBaseCss() {
  return `
    body {
      margin: 0;
      background: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
      letter-spacing: var(--letter-spacing);
    }
    .ahtml-runtime-host {
      box-sizing: border-box;
    }
    .ahtml-gallery-shell {
      grid-template-rows: auto auto minmax(0, 1fr);
      box-sizing: border-box;
      background: var(--background);
    }
    .ahtml-gallery-workbench-card {
      box-shadow: none;
      background: var(--card);
    }
    .ahtml-gallery-stage-action-card {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--card);
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .ahtml-gallery-stage-action-card:hover {
      border-color: var(--border);
      background: var(--accent);
    }
    .ahtml-gallery-inline-metrics {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-inline-metrics strong,
    .ahtml-gallery-goal-number {
      font-size: 1.6rem;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-custom-stack {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-custom-badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-custom-copy {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
    }
  `
}
