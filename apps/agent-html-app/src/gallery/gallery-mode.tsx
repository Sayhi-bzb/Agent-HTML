import * as React from "react"

import {
  type GalleryController,
  useGalleryController,
} from "@/app/gallery/controller"

export function GalleryMode({
  canLeaveWorkspace,
  onActivateGallery,
  onActivateWorkspace,
  onControllerChange,
}: {
  canLeaveWorkspace: () => boolean
  onActivateGallery: () => void
  onActivateWorkspace: () => void
  onControllerChange: (controller: GalleryController | null) => void
}) {
  const gallery = useGalleryController({
    canLeaveWorkspace,
    onActivateGallery,
    onActivateWorkspace,
  })
  const galleryRef = React.useRef(gallery)

  React.useEffect(() => {
    galleryRef.current = gallery
  }, [gallery])

  React.useEffect(() => {
    onControllerChange(gallery)

    return () => onControllerChange(null)
  }, [gallery, onControllerChange])

  React.useEffect(() => {
    galleryRef.current.requestEnterGallery({ skipWorkspaceGuard: true })
  }, [])

  return null
}
