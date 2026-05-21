export function createGalleryWorkbenchBaseCss() {
  return `
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 12%, transparent), transparent 32%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 96%, black 4%), var(--background));
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
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-stage-action-card {
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
    .ahtml-gallery-stage-action-card:hover {
      border-color: color-mix(in srgb, var(--border) 82%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-inline-metrics {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
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
    .ahtml-gallery-workbench-footer {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-footer-card-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
  `
}
