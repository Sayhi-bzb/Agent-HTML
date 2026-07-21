import fs from "node:fs/promises"
import path from "node:path"

import {
  createCanvasInspectionDocument,
  defaultCanvasNodeGeometry,
} from "@agent-html/kernel"
import { extractStaticCanvasIntentGraph } from "@agent-html/kernel/validate"

import { canvasLayoutPathForEntry } from "./canvas-registry.mjs"
import { readStoredCanvasLayout } from "./canvas-layout-storage.mjs"

const localIntentExtensions = [".tsx", ".ts", ".jsx", ".js"]

async function readLocalIntentModule({ fromFilePath, intentRoot, specifier }) {
  if (!specifier.startsWith(".")) {
    throw new TypeError(
      `${fromFilePath}: cold Canvas intent modules must use relative imports`
    )
  }
  const unresolved = path.resolve(path.dirname(fromFilePath), specifier)
  const relative = path.relative(intentRoot, unresolved)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new TypeError(
      `${fromFilePath}: cold Canvas intent module must stay beside the Canvas`
    )
  }
  const candidates = path.extname(unresolved)
    ? [unresolved]
    : [
        ...localIntentExtensions.map(
          (extension) => `${unresolved}${extension}`
        ),
        ...localIntentExtensions.map((extension) =>
          path.join(unresolved, `index${extension}`)
        ),
      ]
  for (const filePath of candidates) {
    try {
      return { filePath, source: await fs.readFile(filePath, "utf8") }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error
    }
  }
  throw new TypeError(
    `${fromFilePath}: cold Canvas intent module ${specifier} was not found`
  )
}

export function createColdCanvasInspectionDocument({
  intent,
  layout,
  sourceFilePath,
}) {
  return createCanvasInspectionDocument({
    canvas: intent.canvas,
    nodes: intent.nodes.map((node, order) => {
      const fallback = defaultCanvasNodeGeometry(order)
      const sourceGeometry = {
        height: node.height ?? fallback.height,
        width: node.width ?? fallback.width,
        x: node.x ?? fallback.x,
        y: node.y ?? fallback.y,
      }
      return {
        ...node,
        ...(layout.nodes[node.id] ?? sourceGeometry),
      }
    }),
    sourceFilePath,
  })
}

export async function readColdCanvasInspectionDocument({
  entryPath,
  sourceFilePath,
}) {
  const [source, layout] = await Promise.all([
    fs.readFile(entryPath, "utf8"),
    readStoredCanvasLayout(canvasLayoutPathForEntry(entryPath)).then(
      (stored) => stored.layout
    ),
  ])
  const intent = await extractStaticCanvasIntentGraph({
    filePath: entryPath,
    loadModule: ({ fromFilePath, specifier }) =>
      readLocalIntentModule({
        fromFilePath,
        intentRoot: path.dirname(entryPath),
        specifier,
      }),
    source,
  })
  return createColdCanvasInspectionDocument({
    intent,
    layout,
    sourceFilePath,
  })
}
