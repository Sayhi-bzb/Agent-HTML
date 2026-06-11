function normalizeAssetPath(assetPath: string) {
  return assetPath.replace(/^\/+/, "")
}

export function artifactPublicUrl(artifactId: string, assetPath: string) {
  return `/__agent-html/artifacts/${artifactId}/public/${normalizeAssetPath(assetPath)}`
}

export function artifactPublicUrlFactory(artifactId: string) {
  return (assetPath: string) => artifactPublicUrl(artifactId, assetPath)
}

export function sharedPublicUrl(assetPath: string) {
  return `/__agent-html/public/${normalizeAssetPath(assetPath)}`
}
