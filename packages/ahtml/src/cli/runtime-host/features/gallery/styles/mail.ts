export function createGalleryMailWorkbenchCss() {
  return `
    .ahtml-gallery-mail-shell {
      display: grid;
      grid-template-columns:
        var(--ahtml-gallery-mail-nav-width)
        minmax(
          var(--ahtml-gallery-mail-list-min-width),
          var(--ahtml-gallery-mail-list-max-width)
        )
        minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
    }
    .ahtml-gallery-mail-nav,
    .ahtml-gallery-mail-list,
    .ahtml-gallery-mail-display {
      display: grid;
      align-content: start;
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      padding: var(--ahtml-gallery-layout-block-padding);
      min-width: 0;
    }
    .ahtml-gallery-mail-nav,
    .ahtml-gallery-mail-list {
      border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-mail-nav-links {
      display: grid;
      gap: 0.6rem;
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-mail-nav-links span.is-active {
      color: var(--sidebar-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-mail-list-toolbar {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-xs);
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-list-header {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-mail-list-header h5 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.1;
    }
    .ahtml-gallery-mail-tab-pills {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-2xs);
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-search-wrap {
      position: relative;
    }
    .ahtml-gallery-mail-search-wrap .ahtml-gallery-control-input,
    .ahtml-gallery-mail-search-wrap [data-slot="input"] {
      padding-left: 2rem;
    }
    .ahtml-gallery-mail-search-icon {
      position: absolute;
      top: 50%;
      left: 0.7rem;
      width: 0.9rem;
      height: 0.9rem;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .ahtml-gallery-mail-list-item {
      display: grid;
      gap: var(--ahtml-space-2xs);
      padding: var(--ahtml-surface-padding-sm);
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.9);
      background: transparent;
      text-align: left;
      color: inherit;
      cursor: pointer;
    }
    .ahtml-gallery-mail-list-item.is-active {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-mail-list-item span {
      color: var(--muted-foreground);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-mail-list-item p {
      margin: 0;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.76rem;
      line-height: 1.45;
    }
    .ahtml-gallery-mail-display-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-display-header h4 {
      margin: 0.12rem 0 0;
      font-size: 1.3rem;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-mail-display-header p {
      margin: 0.25rem 0 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-mail-display-actions {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-xs);
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-display-body {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-mail-display-body p {
      margin: 0;
      color: var(--foreground);
      font-size: 0.92rem;
      line-height: 1.7;
    }
    .ahtml-gallery-mail-quote {
      display: grid;
      gap: var(--ahtml-space-2xs);
      padding: var(--ahtml-surface-padding-md);
      border-left: 2px solid color-mix(in srgb, var(--border) 76%, transparent);
      background: color-mix(in srgb, var(--muted) 38%, transparent);
      border-radius: 0 calc(var(--radius) * 0.9) calc(var(--radius) * 0.9) 0;
    }
    .ahtml-gallery-mail-quote strong {
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-mail-attachments {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-mail-attachment-columns);
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-mail-attachment-card {
      display: grid;
      gap: 0.18rem;
      padding: var(--ahtml-surface-padding-sm);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-mail-attachment-card span {
      color: var(--muted-foreground);
      font-size: 0.76rem;
    }
  `
}
