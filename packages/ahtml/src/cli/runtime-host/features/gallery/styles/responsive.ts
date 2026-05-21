export function createGalleryWorkbenchResponsiveCss() {
  return `
    @media (max-width: 1180px) {
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
      .ahtml-gallery-custom-stat-strip {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 720px) {
      .ahtml-gallery-color-grid,
      .ahtml-gallery-color-mode-grid,
      .ahtml-gallery-typography-grid,
      .ahtml-gallery-custom-grid {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-custom-connection-status {
        align-items: stretch;
      }
    }
  `
}
