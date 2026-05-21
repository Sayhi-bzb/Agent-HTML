export function createGalleryWorkbenchCss() {
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
    .ahtml-gallery-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-shell-header-gap);
      min-height: var(--ahtml-shell-toolbar-min-height);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: var(--background);
    }
    .ahtml-gallery-page-brand {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      min-width: 0;
    }
    .ahtml-gallery-page-brand strong {
      font-family: var(--font-heading);
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-page-brand span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .ahtml-gallery-header-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: var(--ahtml-shell-toolbar-gap);
    }
    .ahtml-gallery-mobile-tabs {
      display: none;
      padding:
        var(--ahtml-shell-mobile-tabs-padding-top)
        var(--ahtml-shell-padding-inline)
        0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-mobile-tabs-list {
      width: 100%;
      border-radius: 0;
      justify-content: flex-start;
      gap: 0.2rem;
      padding: 0;
      background: transparent;
    }
    .ahtml-gallery-mobile-tabs-trigger {
      flex: 1;
      justify-content: center;
    }
    .ahtml-gallery-main {
      display: flex;
      min-height: 0;
      min-width: 0;
      position: relative;
    }
    .ahtml-gallery-sidebar {
      width: var(--ahtml-gallery-sidebar-width);
      min-width: var(--ahtml-gallery-sidebar-min-width);
      overflow: hidden;
    }
    .ahtml-gallery-divider {
      width: var(--ahtml-gallery-divider-width);
      flex: none;
      border-left: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%),
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%)
        );
      cursor: col-resize;
    }
    .ahtml-gallery-sidebar-inner {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .ahtml-gallery-control-header {
      display: grid;
      gap: 0;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-control-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-shell-toolbar-gap);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
      flex-wrap: wrap;
      min-width: 0;
    }
    .ahtml-gallery-control-header-row + .ahtml-gallery-control-header-row {
      border-top: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    }
    .ahtml-gallery-control-header-row-tabs {
      align-items: flex-end;
    }
    .ahtml-gallery-preset-rail {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-preset-rail-gap);
      min-height: var(--ahtml-shell-toolbar-min-height);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preset-copy {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 0;
      flex: 1;
    }
    .ahtml-gallery-preset-workbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-preset-workbar-gap);
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-preset-rail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-preset-inline-gap);
      min-width: 0;
    }
    .ahtml-gallery-preset-rail-status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-preset-inline-status {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-left: auto;
    }
    .ahtml-gallery-preset-select-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
      flex-wrap: nowrap;
    }
    .ahtml-gallery-preset-popover-trigger {
      min-width: var(--ahtml-gallery-preset-trigger-min-width);
      max-width: 100%;
      height: auto;
      justify-content: flex-start;
      gap: var(--ahtml-gallery-preset-trigger-gap);
      padding: 0.45rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-preset-popover-trigger:hover {
      background: color-mix(in srgb, var(--background) 92%, var(--muted) 8%);
    }
    .ahtml-gallery-preset-trigger-copy {
      display: grid;
      min-width: 0;
      text-align: left;
      gap: 0.12rem;
      flex: 1;
    }
    .ahtml-gallery-preset-trigger-copy strong {
      line-height: 1.25;
    }
    .ahtml-gallery-preset-trigger-copy span {
      color: var(--muted-foreground);
      font-size: 0.7rem;
      line-height: 1.3;
    }
    .ahtml-gallery-preset-chevron {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-preset-swatch-row,
    .ahtml-gallery-preset-option-swatch-row {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex: none;
    }
    .ahtml-gallery-preset-swatch {
      width: 0.72rem;
      height: 0.72rem;
      border-radius: 0.28rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, white 18%, transparent);
    }
    .ahtml-gallery-preset-inline-tools {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.18rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-preset-inline-tools [data-slot="button"] {
      min-width: 2rem;
      padding-inline: 0.5rem;
      border-radius: 999px;
    }
    .ahtml-gallery-preset-select {
      min-width: var(--ahtml-gallery-preset-select-min-width);
      max-width: 100%;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      border-color: color-mix(in srgb, var(--border) 80%, transparent);
    }
    .ahtml-gallery-preset-popover {
      width: var(--ahtml-gallery-preset-popover-width);
      padding: var(--ahtml-gallery-preset-popover-padding);
      gap: var(--ahtml-gallery-preset-popover-gap);
    }
    .ahtml-gallery-preset-search-wrap {
      margin-top: 0.1rem;
    }
    .ahtml-gallery-preset-search-field {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.15rem 0.2rem 0.15rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 1);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preset-search-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-preset-search-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-preset-search-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-preset-popover-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.45rem;
    }
    .ahtml-gallery-preset-popover-stat {
      display: grid;
      gap: 0.16rem;
      padding: 0.55rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      min-width: 0;
    }
    .ahtml-gallery-preset-popover-stat span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .ahtml-gallery-preset-popover-stat strong {
      line-height: 1.35;
      word-break: break-word;
    }
    .ahtml-gallery-preset-list-scroll {
      max-height: var(--ahtml-gallery-preset-list-max-height);
    }
    .ahtml-gallery-preset-list {
      display: grid;
      gap: 0.35rem;
      padding-right: 0.25rem;
    }
    .ahtml-gallery-preset-group {
      display: grid;
      gap: 0.35rem;
    }
    .ahtml-gallery-preset-group + .ahtml-gallery-preset-group {
      margin-top: 0.35rem;
      padding-top: 0.55rem;
      border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-preset-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      color: var(--muted-foreground);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preset-option {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      width: 100%;
      padding: 0.6rem 0.65rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.95);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-preset-option:hover,
    .ahtml-gallery-preset-option.is-active {
      border-color: color-mix(in srgb, var(--border) 76%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-preset-option.is-active {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-preset-option-copy {
      display: grid;
      min-width: 0;
      flex: 1;
      gap: 0.18rem;
    }
    .ahtml-gallery-preset-option-copy-top {
      display: grid;
      gap: 0.08rem;
    }
    .ahtml-gallery-preset-option-copy strong {
      line-height: 1.25;
    }
    .ahtml-gallery-preset-option-kicker {
      color: var(--muted-foreground);
      font-size: 0.76rem;
      line-height: 1.35;
    }
    .ahtml-gallery-preset-option-copy-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preset-option-status {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.35rem;
      flex-wrap: wrap;
      flex: none;
    }
    .ahtml-gallery-preset-empty {
      padding: 0.75rem 0.2rem;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-preset-meta {
      display: grid;
      gap: 0.35rem;
      min-width: 8.5rem;
      justify-items: start;
    }
    .ahtml-gallery-preset-footnote {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.68rem;
      line-height: 1.35;
      min-width: 0;
    }
    .ahtml-gallery-preset-footnote span:last-child {
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }
    .ahtml-gallery-section-kicker {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-title {
      margin: 0;
      font-family: var(--font-heading);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-preview-title {
      font-size: 1rem;
      line-height: 1.2;
    }
    .ahtml-gallery-meta,
    .ahtml-gallery-preview-note,
    .ahtml-gallery-toolbar-caption {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-section-note {
      margin: 0 0 0.2rem;
      color: color-mix(in srgb, var(--muted-foreground) 82%, transparent);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .ahtml-gallery-control-tabs {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
    }
    .ahtml-gallery-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--ahtml-shell-toolbar-gap);
      padding: var(--ahtml-shell-padding-block) var(--ahtml-shell-padding-inline);
    }
    .ahtml-gallery-toolbar-border {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-toolbar-copy {
      display: grid;
      gap: 0.12rem;
      min-width: 0;
    }
    .ahtml-gallery-toolbar-label {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-toolbar-caption {
      font-size: 0.76rem;
    }
    .ahtml-gallery-pill-tabs {
      width: fit-content;
      gap: 0.15rem;
      padding: 0;
      border-radius: 999px;
      background: transparent;
    }
    .ahtml-gallery-tabs-trigger-pill {
      height: auto;
      flex: none;
      border-radius: 999px;
      padding: 0.32rem 0.86rem;
      border: 1px solid transparent;
      color: color-mix(in srgb, var(--foreground) 62%, var(--muted-foreground) 38%);
      background: transparent;
      box-shadow: none;
      transition:
        background-color 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-tabs-trigger-pill:hover {
      color: var(--foreground);
      background: color-mix(in srgb, var(--muted) 68%, transparent);
    }
    .ahtml-gallery-tabs-trigger-pill[data-state="active"] {
      border-color: color-mix(in srgb, var(--border) 80%, transparent);
      background: color-mix(in srgb, var(--secondary) 84%, transparent);
      color: var(--secondary-foreground);
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--foreground) 5%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 35%, transparent);
    }
    .ahtml-gallery-pill-scroll {
      width: auto;
      max-width: 100%;
      white-space: nowrap;
    }
    .ahtml-gallery-pill-scroll [data-slot="scroll-area-viewport"] > div {
      display: inline-flex !important;
    }
    .ahtml-gallery-control-body {
      min-height: 0;
      flex: 1;
      overflow: auto;
    }
    .ahtml-gallery-control-filter-bar {
      display: grid;
      gap: 0.55rem;
      padding:
        var(--ahtml-shell-filter-padding-top)
        var(--ahtml-shell-padding-inline)
        var(--ahtml-shell-filter-padding-bottom);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    }
    .ahtml-gallery-control-filter-field {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      padding: 0.15rem 0.2rem 0.15rem 0.6rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-control-filter-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-control-filter-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-control-filter-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-control-filter-clear {
      flex: none;
      min-width: 1.75rem;
      padding-inline: 0.35rem;
    }
    .ahtml-gallery-control-filter-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-filter-actions {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.3rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-filter-pill {
      min-height: 1.7rem;
      border-radius: 999px;
      padding-inline: 0.55rem;
      font-size: 0.66rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-empty {
      padding: 1rem;
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .ahtml-gallery-tab-panel {
      margin-top: 0;
      height: 100%;
    }
    .ahtml-gallery-control-sections {
      display: grid;
      gap: 0;
      padding:
        0
        var(--ahtml-shell-section-padding-inline)
        var(--ahtml-shell-section-padding-bottom);
    }
    .ahtml-gallery-control-sections [data-slot="accordion-item"] {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      padding: 0.12rem 0;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] {
      width: fit-content;
      padding: 0.08rem 0;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      text-decoration: none;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] > span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border-radius: calc(var(--radius) * 0.72);
      border: 1px solid transparent;
      background: color-mix(in srgb, var(--muted) 62%, transparent);
      padding: 0.22rem 0.5rem;
      transition:
        border-color 160ms ease,
        background-color 160ms ease,
        color 160ms ease;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"]:hover > span {
      border-color: color-mix(in srgb, var(--border) 74%, transparent);
      background: color-mix(in srgb, var(--muted) 78%, transparent);
      color: var(--foreground);
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"][data-state="open"] > span {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 84%, transparent);
      color: var(--foreground);
      box-shadow: inset 0 1px 0 color-mix(in srgb, white 25%, transparent);
    }
    .ahtml-gallery-panel-body {
      padding: 0.14rem 0 0.48rem;
    }
    .ahtml-gallery-stack {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
    }
    .ahtml-gallery-control-row,
    .ahtml-gallery-field-row {
      display: grid;
      grid-template-columns: minmax(0, 5.4rem) minmax(0, 1fr);
      align-items: center;
      gap: 0.48rem;
      padding: 0.12rem 0;
    }
    .ahtml-gallery-control-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
      padding-top: 0;
    }
    .ahtml-gallery-control-label {
      font-size: 0.72rem;
      line-height: 1.35;
    }
    .ahtml-gallery-control-description {
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.72rem;
      line-height: 1.42;
    }
    .ahtml-gallery-control-input-wrap {
      min-width: 0;
    }
    .ahtml-gallery-control-input {
      min-height: 2rem;
    }
    .ahtml-gallery-control-input-mono,
    .ahtml-gallery-control-readout {
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.74rem;
    }
    .ahtml-gallery-control-value {
      min-width: 0;
      text-align: left;
    }
    .ahtml-gallery-control-readout {
      display: inline-block;
      line-height: 1.5;
      word-break: break-word;
    }
    .ahtml-gallery-wrap {
      white-space: normal;
    }
    .ahtml-gallery-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ahtml-gallery-error {
      color: hsl(0 72% 50%);
    }
    .ahtml-gallery-slider-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.65rem;
      min-width: 0;
    }
    .ahtml-gallery-slider-control {
      min-width: 0;
    }
    .ahtml-gallery-slider-input-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .ahtml-gallery-slider-input-wrap [data-slot="input"] {
      width: 5rem;
    }
    .ahtml-gallery-slider-unit {
      color: var(--muted-foreground);
      font-size: 0.72rem;
    }
    .ahtml-gallery-control-row-focused,
    .ahtml-gallery-font-field.is-focused,
    .ahtml-gallery-token-row.is-focused {
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-font-field {
      display: grid;
      gap: 0.28rem;
      padding: 0.18rem 0.2rem;
      margin-inline: -0.2rem;
    }
    .ahtml-gallery-font-picker-row {
      align-items: start;
    }
    .ahtml-gallery-font-picker-trigger {
      width: 100%;
      min-height: 2.2rem;
      justify-content: space-between;
    }
    .ahtml-gallery-font-picker-trigger-copy {
      display: grid;
      justify-items: start;
      text-align: left;
      min-width: 0;
    }
    .ahtml-gallery-font-picker-trigger-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
    }
    .ahtml-gallery-font-picker-popover {
      width: min(24rem, calc(100vw - 2rem));
      padding: 0.75rem;
    }
    .ahtml-gallery-font-picker-search {
      position: relative;
      margin-top: 0.5rem;
    }
    .ahtml-gallery-font-picker-search-icon {
      position: absolute;
      top: 50%;
      left: 0.7rem;
      width: 0.85rem;
      height: 0.85rem;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .ahtml-gallery-font-picker-search-input {
      padding-left: 2rem;
    }
    .ahtml-gallery-font-picker-list-scroll {
      max-height: 16rem;
      margin-top: 0.55rem;
    }
    .ahtml-gallery-font-picker-list {
      display: grid;
      gap: 0.3rem;
      padding-right: 0.2rem;
    }
    .ahtml-gallery-font-picker-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      padding: 0.6rem 0.7rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.9);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .ahtml-gallery-font-picker-option:hover,
    .ahtml-gallery-font-picker-option.is-active {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-font-picker-option-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
    }
    .ahtml-gallery-font-picker-option-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
    }
    .ahtml-gallery-font-picker-empty {
      padding: 0.75rem 0.15rem;
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.4;
    }
    .ahtml-gallery-token-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(8.5rem, 0.9fr);
      align-items: center;
      gap: 0.55rem;
      padding: 0.18rem 0.2rem;
      margin-inline: -0.2rem;
    }
    .ahtml-gallery-token-meta {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }
    .ahtml-gallery-token-copy {
      display: grid;
      min-width: 0;
    }
    .ahtml-gallery-token-copy strong {
      font-size: 0.74rem;
      line-height: 1.35;
    }
    .ahtml-gallery-token-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      line-height: 1.35;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }
    .ahtml-gallery-color-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.8);
      background: transparent;
      cursor: pointer;
    }
    .ahtml-gallery-swatch {
      width: 1.15rem;
      height: 1.15rem;
      border-radius: 0.35rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-token-input-wrap {
      min-width: 0;
    }
    .ahtml-gallery-token-input {
      width: 100%;
    }
    .ahtml-gallery-color-popover {
      width: min(22rem, calc(100vw - 2rem));
      padding: 0.75rem;
    }
    .ahtml-gallery-color-popover-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.45rem;
      margin-top: 0.5rem;
    }
    .ahtml-gallery-color-suggestion {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.55rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      cursor: pointer;
      text-align: left;
    }
    .ahtml-gallery-color-suggestion-swatch {
      width: 1rem;
      height: 1rem;
      border-radius: 0.3rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      flex: none;
    }
    .ahtml-gallery-color-popover-input-wrap {
      margin-top: 0.65rem;
    }
    .ahtml-gallery-preview-meta {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
      padding: 0.5rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-preview-meta span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-meta strong {
      font-size: 0.76rem;
      line-height: 1.45;
      word-break: break-word;
    }
    .ahtml-gallery-control-scroll {
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview {
      min-width: 0;
      overflow: hidden;
    }
    .ahtml-gallery-preview-toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.55rem;
      min-width: 0;
    }
    .ahtml-gallery-toolbar-group {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      flex-wrap: wrap;
      padding: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-toolbar-group-label {
      padding-inline: 0.45rem 0.2rem;
      color: var(--muted-foreground);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ahtml-gallery-toolbar-group-body {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-action-separator {
      min-height: 1.6rem;
      margin-inline: 0.15rem;
      background: color-mix(in srgb, var(--border) 74%, transparent);
    }
    .ahtml-gallery-preview-pill-scroll {
      flex: 1;
      min-width: 0;
    }
    .ahtml-gallery-preview-tabs {
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview-shell {
      display: flex;
      min-height: 0;
      height: 100%;
      flex-direction: column;
    }
    .ahtml-gallery-preview-shell[data-fullscreen="true"] {
      background: var(--background);
    }
    .ahtml-gallery-preview-topbar {
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap);
      padding-top: var(--ahtml-shell-preview-toolbar-padding-block);
      padding-bottom: var(--ahtml-shell-preview-toolbar-padding-block);
    }
    .ahtml-gallery-preview-modebar {
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap);
      padding-top: var(--ahtml-shell-preview-toolbar-padding-block);
      padding-bottom: var(--ahtml-shell-preview-toolbar-padding-block);
    }
    .ahtml-gallery-preview-mode-tools {
      display: flex;
      align-items: center;
      gap: var(--ahtml-gallery-preview-mode-tools-gap);
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-more-previews,
    .ahtml-gallery-inspector-button {
      border-radius: 999px;
    }
    .ahtml-gallery-preview-toolbar [data-slot="button"] {
      border-radius: 999px;
    }
    .ahtml-gallery-toolbar-group [data-slot="button"] {
      border-radius: 999px;
    }
    .ahtml-gallery-segmented-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-toggle-button {
      min-width: 4.25rem;
      border-radius: 999px;
    }
    .ahtml-gallery-preset-theme-toggle {
      justify-content: space-between;
    }
    .ahtml-gallery-preview-stage {
      display: flex;
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview-context {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.45rem;
      min-width: 0;
      flex-wrap: wrap;
      color: var(--muted-foreground);
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-context span {
      color: var(--muted-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-preview-context strong {
      color: var(--foreground);
      font-size: 0.72rem;
      line-height: 1;
      letter-spacing: 0;
      text-transform: none;
    }
    .ahtml-gallery-preview-canvas {
      min-height: 0;
      flex: 1;
      overflow: auto;
      padding: 0;
    }
    .ahtml-gallery-preview-panel {
      margin: 0;
      min-height: 100%;
    }
    .ahtml-gallery-stage-frame {
      min-height: 100%;
      border: 0;
      border-radius: 0;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 95%, var(--muted) 5%)
      );
      box-sizing: border-box;
      padding:
        var(--ahtml-gallery-stage-frame-padding-top)
        var(--ahtml-gallery-stage-frame-padding-inline)
        var(--ahtml-gallery-stage-frame-padding-bottom);
    }
    .ahtml-gallery-stage-frame-components,
    .ahtml-gallery-stage-frame-full,
    .ahtml-gallery-stage-frame-custom,
    .ahtml-gallery-stage-frame-dashboard {
      padding-top: var(--ahtml-gallery-stage-frame-mode-padding-top);
    }
    .ahtml-gallery-stage-frame-mail {
      padding-top: var(--ahtml-gallery-stage-frame-mode-padding-top);
    }
    .ahtml-gallery-stage-frame-forms,
    .ahtml-gallery-stage-frame-colors,
    .ahtml-gallery-stage-frame-disclosure,
    .ahtml-gallery-stage-frame-typography {
      display: grid;
      align-items: start;
      justify-items: center;
    }
    .ahtml-gallery-stage-frame-custom,
    .ahtml-gallery-stage-frame-components,
    .ahtml-gallery-stage-frame-dashboard,
    .ahtml-gallery-stage-frame-mail {
      padding-left: var(--ahtml-gallery-stage-frame-mode-padding-inline);
      padding-right: var(--ahtml-gallery-stage-frame-mode-padding-inline);
    }
    .ahtml-gallery-preview-surface {
      position: relative;
      min-height: 100%;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.35);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 95%, var(--muted) 5%)
        );
      box-shadow:
        var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread)
          color-mix(in srgb, var(--shadow-color) calc(var(--shadow-opacity) * 100%), transparent),
        0 10px 32px color-mix(in srgb, var(--foreground) 7%, transparent);
      color: var(--foreground);
      box-sizing: border-box;
    }
    .ahtml-gallery-stage-frame-custom .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-components .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-dashboard .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-mail .ahtml-gallery-preview-surface {
      border-radius: calc(var(--radius) * 1.1);
      box-shadow:
        var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread)
          color-mix(in srgb, var(--shadow-color) calc(var(--shadow-opacity) * 100%), transparent),
        0 6px 18px color-mix(in srgb, var(--foreground) 5%, transparent);
    }
    .ahtml-gallery-preview-surface[data-inspector="true"] {
      cursor: crosshair;
    }
    .ahtml-gallery-preview-surface-inner {
      min-height: 100%;
      padding: var(--ahtml-gallery-preview-surface-inner-padding);
      box-sizing: border-box;
    }
    .ahtml-gallery-inspector-overlay {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      justify-content: flex-end;
      pointer-events: none;
      padding:
        var(--ahtml-gallery-inspector-overlay-padding-top)
        var(--ahtml-gallery-inspector-overlay-padding-inline)
        0;
    }
    .ahtml-gallery-inspector-outline {
      position: absolute;
      border: 1px solid color-mix(in srgb, var(--ring) 82%, white 18%);
      border-radius: calc(var(--radius) * 0.9);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--background) 92%, transparent),
        0 0 0 4px color-mix(in srgb, var(--ring) 18%, transparent);
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      transition:
        top 120ms ease,
        left 120ms ease,
        width 120ms ease,
        height 120ms ease;
    }
    .ahtml-gallery-inspector-outline-label {
      position: absolute;
      top: -0.65rem;
      left: 0.55rem;
      padding: 0.16rem 0.45rem;
      border-radius: 999px;
      background: var(--foreground);
      color: var(--background);
      font-size: 0.67rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ahtml-gallery-inspector-panel {
      display: grid;
      gap: 0.18rem;
      min-width: 13rem;
      max-width: var(--ahtml-gallery-inspector-panel-max-width);
      pointer-events: auto;
      padding:
        var(--ahtml-gallery-compact-panel-padding-block)
        var(--ahtml-gallery-compact-panel-padding-inline);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--popover) 94%, transparent);
      color: var(--popover-foreground);
      box-shadow: 0 12px 40px color-mix(in srgb, var(--foreground) 12%, transparent);
      backdrop-filter: blur(12px);
    }
    .ahtml-gallery-inspector-kicker {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-inspector-panel strong {
      line-height: 1.2;
    }
    .ahtml-gallery-inspector-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.45rem;
      margin-top: 0.35rem;
    }
    .ahtml-gallery-inspector-panel span:last-child {
      color: color-mix(in srgb, var(--popover-foreground) 74%, var(--muted-foreground) 26%);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-inspector-token-group {
      display: grid;
      gap: 0.3rem;
      margin-top: 0.4rem;
    }
    .ahtml-gallery-inspector-token-label {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-inspector-token-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .ahtml-gallery-inspector-token {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.7rem;
      padding: 0.2rem 0.48rem;
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 42%, transparent);
      appearance: none;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.72rem;
      font-weight: 500;
      line-height: 1.2;
      color: var(--popover-foreground);
      word-break: break-word;
      text-align: left;
    }
    .ahtml-gallery-inspector-token.is-action {
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-inspector-token.is-action:hover {
      border-color: color-mix(in srgb, var(--ring) 54%, transparent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }
    .ahtml-gallery-inspector-token.is-focused {
      border-color: color-mix(in srgb, var(--ring) 68%, transparent);
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 16%, transparent);
    }
    .ahtml-gallery-inspector-hint {
      margin-top: 0.35rem;
    }
    .ahtml-gallery-stage-frame-components .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-mail .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-full .ahtml-gallery-preview-surface {
      width: 100%;
    }
    .ahtml-gallery-stage-frame-custom .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-dashboard .ahtml-gallery-preview-surface {
      width: 100%;
    }
    .ahtml-gallery-stage-frame-forms .ahtml-gallery-preview-surface {
      width: min(100%, 58rem);
    }
    .ahtml-gallery-stage-frame-colors .ahtml-gallery-preview-surface {
      width: min(100%, 72rem);
    }
    .ahtml-gallery-stage-frame-disclosure .ahtml-gallery-preview-surface {
      width: min(100%, 62rem);
    }
    .ahtml-gallery-stage-frame-typography .ahtml-gallery-preview-surface {
      width: min(100%, 70rem);
    }
    .ahtml-gallery-preview-document {
      width: 100%;
      padding: 0;
      min-height: auto;
      align-content: start;
    }
    .ahtml-gallery-preview-document .ahtml-prose-block {
      max-width: 68ch;
    }
    .ahtml-gallery-preview-document .ahtml-prose-block > p {
      line-height: 1.75;
    }
    .ahtml-gallery-preview-document .ahtml-prose-inline {
      line-height: 1.65;
    }
    .ahtml-gallery-preview-document .ahtml-section-stack {
      display: grid;
      gap: 1.35rem;
    }
    .ahtml-gallery-preview-document [data-slot="card-content"].ahtml-section-stack > :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) + :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) {
      margin-top: 0;
    }
    .ahtml-gallery-stage-panel {
      display: grid;
      gap: var(--ahtml-gallery-stage-panel-gap);
      width: min(100%, 72rem);
      padding: 0.25rem;
    }
    .ahtml-gallery-stage-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-stage-toolbar-gap);
      flex-wrap: wrap;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-stage-toolbar-inset {
      padding:
        var(--ahtml-shell-stage-toolbar-padding-block)
        var(--ahtml-shell-padding-inline);
      margin: -1rem -1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-stage-toolbar-copy {
      display: grid;
      gap: 0.12rem;
      min-width: 0;
    }
    .ahtml-gallery-stage-toolbar-copy strong {
      font-size: 0.92rem;
      line-height: 1.35;
      letter-spacing: -0.01em;
    }
    .ahtml-gallery-stage-toolbar-meta {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-wrap: wrap;
      min-width: 0;
    }
    .ahtml-gallery-stage-panel-header {
      display: grid;
      gap: 0.2rem;
      max-width: 44rem;
    }
    .ahtml-gallery-stage-panel-header h3 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .ahtml-gallery-stage-panel-header p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-stage-panel-kicker {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-panel {
      max-width: var(--ahtml-gallery-panel-max-width-reading);
    }
    .ahtml-gallery-color-panel {
      width: min(100%, var(--ahtml-gallery-panel-max-width));
    }
    .ahtml-gallery-custom-panel {
      width: min(100%, var(--ahtml-gallery-panel-max-width));
    }
    .ahtml-gallery-workbench-panel {
      width: min(100%, var(--ahtml-gallery-panel-max-width-wide));
    }
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
      grid-template-columns: auto minmax(0, 1fr) auto;
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
      gap: 0.35rem;
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
    .ahtml-gallery-custom-preview-empty {
      display: grid;
      justify-items: center;
      gap: var(--ahtml-gallery-layout-gap);
      margin: 0 var(--ahtml-gallery-layout-inline-padding);
      padding:
        var(--ahtml-gallery-custom-preview-empty-padding-block)
        var(--ahtml-gallery-layout-block-padding);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.15);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      text-align: center;
    }
    .ahtml-gallery-custom-preview-empty h4 {
      margin: 0;
      font-size: 1.15rem;
      line-height: 1.2;
    }
    .ahtml-gallery-custom-preview-empty-icons {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
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
    .ahtml-gallery-custom-preview-steps {
      display: grid;
      gap: 0.5rem;
      max-width: var(--ahtml-gallery-custom-preview-steps-max-width);
    }
    .ahtml-gallery-custom-preview-steps div {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 0.55rem;
      text-align: left;
    }
    .ahtml-gallery-custom-preview-steps span {
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-custom-preview-guides {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
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
      margin: 0 var(--ahtml-gallery-layout-inline-padding);
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
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      margin: 0 var(--ahtml-gallery-layout-inline-padding);
      padding: var(--ahtml-gallery-layout-block-padding);
      border-radius: calc(var(--radius) * 1.05);
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
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ahtml-gallery-custom-stage-grid {
      display: grid;
      grid-template-columns:
        minmax(0, 1.45fr)
        minmax(var(--ahtml-gallery-custom-stage-secondary-min-width), 0.75fr);
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
    .ahtml-gallery-custom-hero-panel {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-compact);
      align-content: start;
    }
    .ahtml-gallery-custom-swatch-stack {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-custom-swatch-columns);
      gap: 0.45rem;
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
    .ahtml-gallery-custom-stack {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-workbench-card {
      box-shadow: none;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-custom-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ahtml-gallery-custom-copy {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
    }
    .ahtml-gallery-custom-note-list,
    .ahtml-gallery-custom-signal-list {
      display: grid;
      gap: 0.55rem;
    }
    .ahtml-gallery-custom-note-list span {
      color: var(--muted-foreground);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-custom-progress-list {
      display: grid;
      gap: 0.7rem;
    }
    .ahtml-gallery-custom-progress-row {
      display: grid;
      gap: 0.35rem;
    }
    .ahtml-gallery-custom-signal-item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
      gap: 0.5rem;
    }
    .ahtml-gallery-custom-signal-dot {
      width: 0.55rem;
      height: 0.55rem;
      margin-top: 0.35rem;
      border-radius: 999px;
      background: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
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
    .ahtml-gallery-color-content {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap);
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
      gap: 0.35rem;
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
    .ahtml-gallery-toggle-list label,
    .ahtml-gallery-feature-list label {
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
    .ahtml-gallery-workbench-footer {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-footer-card-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-color-hero {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-color-hero-card-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-color-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-color-grid-card-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-color-mode-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-color-mode-card-min-width), 1fr));
      gap: 0.9rem;
    }
    .ahtml-gallery-color-mode-panel {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap-relaxed);
      padding: var(--ahtml-gallery-content-card-padding-relaxed);
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-color-mode-panel.is-active {
      border-color: color-mix(in srgb, var(--ring) 58%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-color-mode-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ahtml-gallery-layout-gap-compact);
      flex-wrap: wrap;
    }
    .ahtml-gallery-color-mode-copy {
      display: grid;
      gap: 0.08rem;
    }
    .ahtml-gallery-color-mode-copy span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-color-mode-copy strong {
      font-size: 0.86rem;
      line-height: 1.3;
    }
    .ahtml-gallery-color-card {
      display: grid;
      gap: 0.7rem;
      width: 100%;
      padding: var(--ahtml-gallery-content-card-padding-relaxed);
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
    .ahtml-gallery-color-card:hover {
      border-color: color-mix(in srgb, var(--border) 82%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-color-card-swatch {
      display: block;
      width: 100%;
      min-height: 4.25rem;
      border-radius: calc(var(--radius) * 0.9);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-color-card-copy {
      display: grid;
      gap: 0.2rem;
    }
    .ahtml-gallery-color-card-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-color-card-copy strong {
      font-family: monospace;
      font-size: 0.88rem;
      line-height: 1.45;
      word-break: break-word;
    }
    .ahtml-gallery-color-card-action {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-content {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-typography-sample-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-typography-sample-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-typography-sample {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-content-card-padding);
    }
    .ahtml-gallery-typography-sample h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3rem);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-typography-body-card {
      display: flex;
      flex-direction: column;
      gap: var(--ahtml-gallery-layout-gap-compact);
      padding: var(--ahtml-gallery-content-card-padding);
    }
    .ahtml-gallery-typography-body-copy {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.65;
      color: var(--foreground);
    }
    .ahtml-gallery-typography-note-stack {
      display: grid;
      gap: 0.7rem;
    }
    .ahtml-gallery-typography-note-stack p {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.55;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-chip {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 0.35rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-kicker {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(var(--ahtml-gallery-typography-token-min-width), 1fr));
      gap: var(--ahtml-gallery-layout-gap-compact);
    }
    .ahtml-gallery-typography-token {
      display: grid;
      gap: 0.5rem;
      padding: var(--ahtml-gallery-content-card-padding);
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--muted) 56%, transparent);
      font-family: monospace;
      font-size: 0.86rem;
    }
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
      gap: 0.55rem;
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
    .ahtml-gallery-dashboard-header h4,
    .ahtml-gallery-mail-display-header h4,
    .ahtml-gallery-pricing-header h4 {
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
      gap: 0.5rem;
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
      gap: 0.45rem;
      min-width: 0;
    }
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
      gap: 0.45rem;
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
      gap: 0.35rem;
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
      gap: 0.35rem;
      padding: 0.8rem;
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
    .ahtml-gallery-mail-display-header p {
      margin: 0.25rem 0 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-mail-display-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
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
      gap: 0.35rem;
      padding: 0.9rem;
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
      padding: 0.8rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-mail-attachment-card span {
      color: var(--muted-foreground);
      font-size: 0.76rem;
    }
    .ahtml-gallery-pricing-shell {
      display: grid;
      gap: var(--ahtml-gallery-layout-gap);
    }
    .ahtml-gallery-pricing-header {
      display: grid;
      gap: 0.55rem;
      justify-items: start;
    }
    .ahtml-gallery-pricing-header p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
    }
    .ahtml-gallery-pricing-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.4rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      color: var(--muted-foreground);
      font-size: 0.78rem;
    }
    .ahtml-gallery-pricing-grid {
      display: grid;
      grid-template-columns: var(--ahtml-gallery-pricing-columns);
      gap: 0.85rem;
    }
    .ahtml-gallery-feature-list {
      display: grid;
      gap: 0.55rem;
    }
    @media (max-width: 1180px) {
      .ahtml-gallery-preview-context {
        display: none;
      }
      .ahtml-gallery-dashboard-section-cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ahtml-gallery-dashboard-lower {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-mail-shell {
        grid-template-columns:
          11rem
          minmax(14rem, var(--ahtml-gallery-dashboard-secondary-min-width))
          minmax(0, 1fr);
      }
      .ahtml-gallery-custom-stage-grid,
      .ahtml-gallery-custom-grid-rich {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 960px) {
      .ahtml-gallery-mobile-tabs {
        display: block;
      }
      .ahtml-gallery-divider {
        display: none;
      }
      .ahtml-gallery-main,
      .ahtml-gallery-workbench,
      .ahtml-gallery-sidebar,
      .ahtml-gallery-preview {
        min-width: 0;
      }
      .ahtml-gallery-sidebar,
      .ahtml-gallery-preview {
        width: 100%;
        min-width: 0;
      }
      .ahtml-gallery-sidebar[data-mobile-panel="hidden"],
      .ahtml-gallery-preview[data-mobile-panel="hidden"] {
        display: none;
      }
      .ahtml-gallery-sidebar[data-mobile-panel="active"],
      .ahtml-gallery-preview[data-mobile-panel="active"] {
        display: block;
      }
      .ahtml-gallery-cards-workbench,
      .ahtml-gallery-cards-split,
      .ahtml-gallery-mail-shell,
      .ahtml-gallery-dashboard-shell,
      .ahtml-gallery-pricing-grid,
      .ahtml-gallery-dashboard-section-cards,
      .ahtml-gallery-dashboard-chart-footer,
      .ahtml-gallery-mail-attachments,
      .ahtml-gallery-custom-stage-grid {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-dashboard-sidebar,
      .ahtml-gallery-mail-nav,
      .ahtml-gallery-mail-list {
        border-right: 0;
        border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      }
      .ahtml-gallery-custom-site-header {
        grid-template-columns: 1fr;
        justify-items: start;
      }
      .ahtml-gallery-custom-site-nav {
        justify-content: flex-start;
      }
      .ahtml-gallery-stat-strip {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 720px) {
      .ahtml-gallery-page-header,
      .ahtml-gallery-toolbar,
      .ahtml-gallery-control-header-row,
      .ahtml-gallery-stage-toolbar-inset {
        padding-left: var(--ahtml-shell-padding-inline);
        padding-right: var(--ahtml-shell-padding-inline);
      }
      .ahtml-gallery-control-sections {
        padding-left: var(--ahtml-shell-section-padding-inline);
        padding-right: var(--ahtml-shell-section-padding-inline);
      }
      .ahtml-gallery-control-row,
      .ahtml-gallery-field-row,
      .ahtml-gallery-token-row {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-slider-field,
      .ahtml-gallery-token-row {
        gap: 0.45rem;
      }
      .ahtml-gallery-preset-popover-stats,
      .ahtml-gallery-color-grid,
      .ahtml-gallery-color-mode-grid,
      .ahtml-gallery-typography-grid,
      .ahtml-gallery-custom-grid {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-inspector-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ahtml-gallery-custom-connection-status,
      .ahtml-gallery-preview-toolbar,
      .ahtml-gallery-preview-mode-tools {
        align-items: stretch;
      }
      .ahtml-gallery-toolbar-group,
      .ahtml-gallery-segmented-toggle {
        width: 100%;
      }
    }
  `
}
