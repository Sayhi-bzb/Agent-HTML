export function createGalleryMailWorkbenchCss() {
  return `
    .ahtml-gallery-mail-shell {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-mail-shell-columns);
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 10%, transparent), transparent 28%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 99%, var(--muted) 1%), color-mix(in srgb, var(--background) 95%, var(--muted) 5%));
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
    .ahtml-gallery-mail-nav-profile,
    .ahtml-gallery-mail-nav-section {
      display: grid;
      gap: var(--ahtml-space-sm);
    }
    .ahtml-gallery-mail-nav-profile p {
      margin: 0;
      color: color-mix(in srgb, var(--sidebar-foreground) 74%, transparent);
      font-size: var(--ahtml-gallery-text-body-size);
      line-height: 1.5;
    }
    .ahtml-gallery-mail-nav-label {
      color: color-mix(in srgb, var(--sidebar-foreground) 68%, transparent);
      font-size: var(--ahtml-gallery-text-label-size);
      font-weight: 700;
      letter-spacing: var(--ahtml-gallery-tracking-kicker);
      text-transform: uppercase;
    }
    .ahtml-gallery-mail-nav-links {
      display: grid;
      gap: var(--ahtml-space-sm);
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-supporting-size);
    }
    .ahtml-gallery-mail-nav-links span {
      display: flex;
      align-items: center;
      min-height: var(--ahtml-gallery-nav-item-min-height);
      padding: 0 var(--ahtml-gallery-nav-item-padding-inline);
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, white 6%, transparent);
    }
    .ahtml-gallery-mail-nav-links span.is-active {
      color: var(--sidebar-foreground);
      font-weight: 700;
      background: color-mix(in srgb, var(--sidebar-primary) 22%, transparent);
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
    .ahtml-gallery-mail-list-heading {
      display: grid;
      gap: var(--ahtml-gallery-copy-stack-gap-tight);
    }
    .ahtml-gallery-mail-list-header h5 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.1;
    }
    .ahtml-gallery-mail-list-header p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-body-size);
      line-height: 1.5;
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
      padding-left: var(--ahtml-gallery-control-input-padding-start);
    }
    .ahtml-gallery-mail-search-icon {
      position: absolute;
      top: 50%;
      left: var(--ahtml-gallery-control-icon-offset-inline);
      width: var(--ahtml-gallery-control-icon-size);
      height: var(--ahtml-gallery-control-icon-size);
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .ahtml-gallery-mail-list-item {
      display: grid;
      gap: var(--ahtml-space-2xs);
      padding: var(--ahtml-surface-padding-sm);
      border: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      text-align: left;
      color: inherit;
      cursor: pointer;
    }
    .ahtml-gallery-mail-list-item.is-active {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background:
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--card) 96%, white 4%),
          color-mix(in srgb, var(--accent) 10%, var(--card) 90%)
        );
      box-shadow: 0 14px 26px color-mix(in srgb, var(--foreground) 5%, transparent);
    }
    .ahtml-gallery-mail-list-item-copy {
      display: grid;
      gap: var(--ahtml-gallery-copy-stack-gap-compact);
    }
    .ahtml-gallery-mail-list-item-subject {
      color: var(--foreground);
      font-size: var(--ahtml-gallery-text-strong-size);
      font-weight: 600;
      line-height: 1.35;
    }
    .ahtml-gallery-mail-list-item span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-body-size);
      line-height: 1.45;
    }
    .ahtml-gallery-mail-list-item p {
      margin: 0;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: var(--ahtml-gallery-text-chip-size);
      line-height: 1.45;
    }
    .ahtml-gallery-mail-list-item-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-space-xs);
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-display-header p {
      margin: 0.25rem 0 0;
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-supporting-size);
    }
    .ahtml-gallery-mail-display-actions {
      display: inline-flex;
      align-items: center;
      gap: var(--ahtml-space-xs);
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-thread-summary {
      grid-template-columns: var(--ahtml-gallery-three-up-columns);
      padding:
        var(--ahtml-gallery-compact-panel-padding-block)
        0;
      border-top: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 48%, transparent);
    }
    .ahtml-gallery-mail-display-body {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-mail-display-body p {
      margin: 0;
      color: var(--foreground);
      font-size: var(--ahtml-gallery-text-body-size);
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
      font-size: var(--ahtml-gallery-text-meta-size);
      letter-spacing: var(--ahtml-gallery-tracking-chip);
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
      gap: var(--ahtml-gallery-copy-stack-gap-compact);
      padding: var(--ahtml-surface-padding-sm);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-mail-attachment-card span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-chip-size);
    }
    .ahtml-gallery-mail-composer {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-surface-padding-sm);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-mail-composer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-space-sm);
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-composer-footer span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-meta-size);
      line-height: 1.45;
      flex: 1;
      min-width: 0;
    }
  `
}
