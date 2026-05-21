export function createGalleryCustomWorkbenchCss() {
  return `
    .ahtml-gallery-custom-content {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-custom-browser {
      display: grid;
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.25);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
      box-shadow: 0 12px 30px color-mix(in srgb, var(--foreground) 7%, transparent);
    }
    .ahtml-gallery-custom-preview-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding:
        var(--ahtml-gallery-tight-toolbar-padding-block)
        var(--ahtml-gallery-compact-panel-padding-inline);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 54%, transparent);
      flex-wrap: wrap;
    }
    .ahtml-gallery-custom-preview-input {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      min-width: var(--ahtml-gallery-custom-preview-input-min-width);
      flex: 1;
      padding-left: 0.2rem;
    }
    .ahtml-gallery-custom-preview-input [data-slot="input"] {
      padding-left: 2rem;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.76rem;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-custom-preview-input-icon {
      position: absolute;
      left: 0.8rem;
      top: 50%;
      width: 0.9rem;
      height: 0.9rem;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
      z-index: 1;
    }
    .ahtml-gallery-custom-preview-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-custom-browser-bar {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-triptych-columns);
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding:
        var(--ahtml-gallery-compact-panel-padding-block)
        var(--ahtml-gallery-compact-panel-padding-inline);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-custom-browser-dots {
      display: inline-flex;
      gap: var(--ahtml-space-2xs);
    }
    .ahtml-gallery-custom-browser-dots span {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--muted-foreground) 26%, transparent);
    }
    .ahtml-gallery-custom-browser-url {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--muted-foreground);
      font-size: 0.76rem;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }
    .ahtml-gallery-custom-page {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      padding: 0;
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 12%, transparent), transparent 32%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 99%, var(--muted) 1%), color-mix(in srgb, var(--background) 95%, var(--muted) 5%));
    }
    .ahtml-gallery-custom-surface-shell {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      padding:
        0
        var(--ahtml-gallery-layout-inline-padding)
        var(--ahtml-gallery-layout-block-padding);
    }
    .ahtml-gallery-custom-preview-empty-icons {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-md);
    }
    .ahtml-gallery-custom-preview-empty-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: calc(var(--radius) * 0.95);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-custom-preview-empty-separator {
      color: var(--muted-foreground);
    }
    .ahtml-gallery-custom-preview-status-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-custom-status-columns);
      gap: var(--ahtml-gallery-layout-gap);
      align-items: stretch;
    }
    .ahtml-gallery-custom-preview-callout {
      display: grid;
      align-content: start;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding:
        var(--ahtml-gallery-custom-preview-empty-padding-block)
        var(--ahtml-gallery-layout-block-padding);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-custom-preview-callout-copy {
      display: grid;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-custom-preview-callout-copy h4 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .ahtml-gallery-custom-preview-callout-copy p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
    }
    .ahtml-gallery-custom-preview-guides {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-custom-preview-guides button {
      padding: 0.45rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: transparent;
      color: var(--foreground);
      font: inherit;
    }
    .ahtml-gallery-custom-connection-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding:
        var(--ahtml-gallery-compact-panel-padding-block)
        var(--ahtml-gallery-compact-panel-padding-inline);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      flex-wrap: wrap;
    }
    .ahtml-gallery-custom-connection-indicator {
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--primary) 88%, white 12%);
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--primary) 12%, transparent);
    }
    .ahtml-gallery-custom-connection-label {
      flex: 1;
      min-width: 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-custom-site-header {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-triptych-columns);
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      padding: var(--ahtml-gallery-layout-block-padding);
      border-radius: calc(var(--radius) * 1.05);
      border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-custom-site-brand {
      display: grid;
      gap: 0.18rem;
    }
    .ahtml-gallery-custom-site-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      min-width: 0;
      flex-wrap: wrap;
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-custom-site-nav span.is-active {
      color: var(--foreground);
      font-weight: 700;
    }
    .ahtml-gallery-custom-site-actions {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-sm);
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ahtml-gallery-custom-stage-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-custom-stage-columns);
      gap: var(--ahtml-gallery-layout-gap);
      padding: 0 var(--ahtml-gallery-layout-inline-padding);
      align-items: stretch;
    }
    .ahtml-gallery-custom-hero {
      display: grid;
      padding: var(--ahtml-gallery-custom-hero-padding);
      border-radius: calc(var(--radius) * 1.2);
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--card) 96%, white 4%), color-mix(in srgb, var(--accent) 10%, var(--card) 90%));
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-custom-hero-copy {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      align-content: start;
    }
    .ahtml-gallery-custom-hero-copy h3 {
      margin: 0;
      font-size: clamp(1.9rem, 4vw, 2.8rem);
      line-height: 1.05;
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-custom-hero-copy p {
      margin: 0;
      max-width: 38rem;
      font-size: 0.95rem;
      line-height: 1.7;
      color: color-mix(in srgb, var(--foreground) 88%, transparent);
    }
    .ahtml-gallery-custom-hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .ahtml-gallery-custom-stat-strip {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-custom-stat-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-custom-stat {
      display: grid;
      gap: 0.16rem;
      padding: 0.75rem 0.85rem;
      border-radius: calc(var(--radius) * 0.95);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-custom-stat span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-custom-side-stack {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      align-content: start;
    }
    .ahtml-gallery-custom-swatch-stack {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-custom-swatch-columns);
      gap: var(--ahtml-space-xs);
    }
    .ahtml-gallery-custom-swatch-stack span {
      min-height: 3.2rem;
      border-radius: calc(var(--radius) * 0.95);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-custom-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-custom-card-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      padding:
        0
        var(--ahtml-gallery-layout-inline-padding)
        var(--ahtml-gallery-layout-block-padding);
    }
    .ahtml-gallery-custom-grid-rich {
      grid-template-columns: var(--ahtml-gallery-custom-rich-columns);
    }
    .ahtml-gallery-custom-card {
      box-shadow: none;
    }
    .ahtml-gallery-custom-side-card {
      height: 100%;
      align-self: stretch;
    }
    .ahtml-gallery-custom-conversion-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding-bottom: var(--ahtml-space-sm);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
    }
    .ahtml-gallery-custom-conversion-row:last-of-type {
      padding-bottom: 0;
    }
    .ahtml-gallery-custom-note-list,
    .ahtml-gallery-custom-signal-list {
      display: grid;
      gap: var(--ahtml-space-md);
    }
    .ahtml-gallery-custom-note-list span {
      color: var(--muted-foreground);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-custom-progress-list {
      display: grid;
      gap: var(--ahtml-space-lg);
    }
    .ahtml-gallery-custom-progress-row {
      display: grid;
      gap: var(--ahtml-space-2xs);
    }
    .ahtml-gallery-custom-signal-item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-custom-signal-dot {
      width: 0.55rem;
      height: 0.55rem;
      margin-top: 0.35rem;
      border-radius: 999px;
      background: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
    }
  `
}
