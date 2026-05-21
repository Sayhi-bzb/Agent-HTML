export function createGalleryCardsWorkbenchCss() {
  return `
    .ahtml-gallery-cards-workbench {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-cards-workbench-columns);
      gap: var(--ahtml-gallery-layout-gap);
      align-items: start;
    }
    .ahtml-gallery-cards-column {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
      align-content: start;
    }
    .ahtml-gallery-cards-split {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-cards-split-columns);
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-cards-split-tight {
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-mini-calendar {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: var(--ahtml-space-2xs);
      text-align: center;
      font-size: 0.72rem;
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
      font-size: 0.82rem;
    }
    .ahtml-gallery-chat-thread {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-chat-thread > div {
      display: grid;
      gap: 0.22rem;
      padding: var(--ahtml-gallery-layout-gap-compact);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--muted) 48%, transparent);
    }
    .ahtml-gallery-chat-thread > div.is-reply {
      background: color-mix(in srgb, var(--secondary) 72%, transparent);
    }
    .ahtml-gallery-chat-thread p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-member-list {
      display: grid;
      gap: 0.65rem;
    }
    .ahtml-gallery-member-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.65rem;
    }
    .ahtml-gallery-member-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--secondary) 76%, transparent);
      color: var(--secondary-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-member-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
    }
    .ahtml-gallery-member-copy span {
      color: var(--muted-foreground);
      font-size: 0.76rem;
    }
  `
}
