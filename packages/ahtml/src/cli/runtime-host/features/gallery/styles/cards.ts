export function createGalleryCardsWorkbenchCss() {
  return `
    .ahtml-gallery-cards-catalog {
      display: grid;
      gap: calc(var(--ahtml-gallery-layout-gap) * 1.15);
    }
    .ahtml-gallery-cards-family {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-workbench-side-rail-columns);
      gap: var(--ahtml-gallery-layout-gap);
      align-items: start;
      padding-top: calc(var(--ahtml-gallery-layout-gap) * 0.15);
      border-top: 1px solid color-mix(in srgb, var(--border) 56%, transparent);
    }
    .ahtml-gallery-cards-family:first-child {
      padding-top: 0;
      border-top: 0;
    }
    .ahtml-gallery-cards-family-header {
      display: grid;
      gap: var(--ahtml-space-2xs);
      align-content: start;
      min-width: 0;
      padding-top: 0.1rem;
      max-width: 20rem;
    }
    .ahtml-gallery-cards-family-header h4 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .ahtml-gallery-cards-family-header p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-supporting-size);
      line-height: 1.5;
    }
    .ahtml-gallery-cards-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-showcase-grid-columns);
      gap: var(--ahtml-gallery-layout-gap);
      align-items: start;
      min-width: 0;
    }
    .ahtml-gallery-cards-grid-content .ahtml-gallery-cards-card-feature,
    .ahtml-gallery-cards-grid-forms .ahtml-gallery-cards-card-feature {
      grid-column: span 6;
      min-height: 100%;
    }
    .ahtml-gallery-cards-grid-content .ahtml-gallery-cards-card {
      grid-column: span 3;
    }
    .ahtml-gallery-cards-grid-forms .ahtml-gallery-cards-card {
      grid-column: span 3;
    }
    .ahtml-gallery-cards-grid-selection .ahtml-gallery-cards-card,
    .ahtml-gallery-cards-grid-collaboration .ahtml-gallery-cards-card {
      grid-column: span 6;
    }
    .ahtml-gallery-cards-card {
      min-width: 0;
      height: 100%;
      border-color: var(--border);
      background: var(--card);
      box-shadow: none;
    }
    .ahtml-gallery-cards-card-feature {
      background: var(--card);
      box-shadow: none;
    }
    .ahtml-gallery-cards-card [data-slot="card-header"] {
      padding-bottom: var(--ahtml-space-sm);
    }
    .ahtml-gallery-cards-card [data-slot="card-title"] {
      letter-spacing: -0.02em;
      line-height: 1.15;
    }
    .ahtml-gallery-cards-grid-content .ahtml-gallery-cards-card:nth-child(2),
    .ahtml-gallery-cards-grid-forms .ahtml-gallery-cards-card:nth-child(3) {
      transform: none;
    }
    .ahtml-gallery-mini-calendar {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: var(--ahtml-space-2xs);
      text-align: center;
      font-size: var(--ahtml-gallery-text-chip-size);
      color: var(--muted-foreground);
    }
    .ahtml-gallery-mini-calendar span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.85rem;
      border-radius: calc(var(--radius) * 0.7);
      background: color-mix(in srgb, var(--background) 95%, var(--muted) 5%);
    }
    .ahtml-gallery-mini-calendar span.is-active {
      background: var(--primary);
      color: var(--primary-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-toggle-list {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-toggle-list label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      font-size: var(--ahtml-gallery-text-supporting-size);
    }
    .ahtml-gallery-chat-thread {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-chat-thread > div {
      display: grid;
      gap: var(--ahtml-space-2xs);
      padding: var(--ahtml-gallery-layout-gap-compact);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--card);
    }
    .ahtml-gallery-chat-thread > div.is-reply {
      background: var(--muted);
    }
    .ahtml-gallery-chat-thread p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-member-list {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-member-row {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-triptych-columns);
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-member-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--ahtml-gallery-control-size);
      height: var(--ahtml-gallery-control-size);
      border-radius: var(--ahtml-gallery-radius-full);
      background: color-mix(in srgb, var(--secondary) 76%, transparent);
      color: var(--secondary-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-member-copy {
      display: grid;
      gap: var(--ahtml-space-2xs);
      min-width: 0;
    }
    .ahtml-gallery-member-copy span {
      color: var(--muted-foreground);
      font-size: var(--ahtml-gallery-text-meta-size);
    }
  `
}
