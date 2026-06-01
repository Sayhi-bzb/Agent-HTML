function preloadGalleryEditorPanel() {
  void import("@/app/gallery/editor")
}

function preloadGalleryWorkspaceSurface() {
  void import("@/app/gallery/workspace-surface")
}

export function preloadGalleryComponentMarketView() {
  void import("@/app/gallery/component-market-view")
}

export function preloadGalleryThemeView() {
  preloadGalleryEditorPanel()
  preloadGalleryWorkspaceSurface()
}
