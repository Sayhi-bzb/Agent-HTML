import * as React from "react"

export const GalleryEditorPanel = React.lazy(() =>
  import("@/app/gallery/editor").then((module) => ({
    default: module.GalleryEditorPanel,
  }))
)
