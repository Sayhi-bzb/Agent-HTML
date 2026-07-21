import {
  inspectCanvasNode,
  inspectCanvasOverview,
  inspectCanvasViewport,
  normalizeCanvasInspectionDocument,
  resolveCanvasNodeSource,
} from "@agent-html/kernel"

export function createCanvasInspectionRegistry() {
  const documents = new Map()

  return {
    clear(filePath) {
      documents.delete(filePath)
    },
    getDocument(filePath) {
      return documents.get(filePath) ?? null
    },
    inspectNode(filePath, nodeId) {
      const document = documents.get(filePath)
      return document ? inspectCanvasNode(document, nodeId) : null
    },
    inspectOverview(filePath) {
      const document = documents.get(filePath)
      return document ? inspectCanvasOverview(document) : null
    },
    inspectViewport(filePath, bounds) {
      const document = documents.get(filePath)
      return document ? inspectCanvasViewport(document, bounds) : null
    },
    publish(value) {
      const document = normalizeCanvasInspectionDocument(value)
      documents.set(document.sourceFilePath, document)
      return document
    },
    resolveNodeSource(filePath, nodeId) {
      const document = documents.get(filePath)
      return document ? resolveCanvasNodeSource(document, nodeId) : null
    },
  }
}
