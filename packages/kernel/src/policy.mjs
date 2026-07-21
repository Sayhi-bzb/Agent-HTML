export const CANVAS_POLICY_VERSION = 1

export const canvasInteractionEventName = "agent-html:state-change"

export const canvasDomAttributes = Object.freeze({
  artifact: "data-agent-html-artifact",
  artifactTitle: "data-agent-html-title",
  block: "data-agent-html-block",
  blockId: "data-agent-html-block-id",
  blockTitle: "data-agent-html-block-title"
})

export const canvasDiagnosticCategories = Object.freeze({
  dependency: "dependency",
  manifest: "manifest",
  protocol: "protocol",
  style: "style",
  workspace: "workspace"
})

export const canvasDiagnosticCodes = Object.freeze({
  artifactDefaultExport: "canvas/protocol/default-export",
  artifactDefinition: "canvas/protocol/define-artifact",
  artifactTitle: "canvas/protocol/static-title",
  artifactBlocks: "canvas/protocol/blocks-required",
  blockIdFormat: "canvas/protocol/block-id-format",
  blockIdDuplicate: "canvas/protocol/block-id-duplicate",
  forbiddenImport: "canvas/workspace/forbidden-import",
  publicImport: "canvas/workspace/public-import",
  legacyRuntime: "canvas/workspace/legacy-runtime",
  nativeControl: "canvas/workspace/native-control",
  nativeTable: "canvas/workspace/native-table",
  inlineStyle: "canvas/style/inline-style",
  unsafeClassName: "canvas/style/unsafe-class",
  parseError: "canvas/protocol/parse-error",
  dependencyBoundary: "canvas/dependency/boundary",
  manifestDrift: "canvas/manifest/catalog-drift"
})

export const canvasSourceLayers = Object.freeze([
  { name: "artifact", path: "^agent-html/artifacts/" },
  { name: "composite", path: "^agent-html/components/(?!ui/)" },
  { name: "primitive", path: "^agent-html/components/ui/" },
  { name: "foundation", path: "^agent-html/(hooks|lib|schema|theme|styles)/" },
  { name: "protocol", path: "^packages/react/src/" }
])

export const canvasUnsafeClassPatterns = Object.freeze([
  "\\b(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}\\b",
  "\\b(?:gradient|shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl)|text-(?:[3-9]xl|[1-9][0-9]xl)|font-\\w+|tracking-\\w+)\\b",
  "\\[[^\\]]+\\]"
])

export function createCanvasDependencyCruiserConfig() {
  const fromCanvas = { path: "^agent-html/" }
  return {
    forbidden: [
      {
        name: "canvas-no-unresolvable",
        severity: "error",
        from: fromCanvas,
        to: { couldNotResolve: true }
      },
      {
        name: "canvas-no-runtime-circular",
        severity: "error",
        from: fromCanvas,
        to: {
          circular: true,
          dependencyTypesNot: ["type-only", "type-import"]
        }
      },
      {
        name: "canvas-portable-workspace",
        severity: "error",
        from: fromCanvas,
        to: { path: "^(apps/|packages/cli/|packages/kernel/|src/|config/)" }
      },
      {
        name: "canvas-foundation-is-leaf",
        severity: "error",
        from: { path: "^agent-html/(hooks|lib|schema|theme)/" },
        to: { path: "^agent-html/(artifacts|components)/" }
      },
      {
        name: "canvas-primitives-ignore-artifacts",
        severity: "error",
        from: { path: "^agent-html/components/ui/" },
        to: { path: "^agent-html/artifacts/" }
      },
      {
        name: "canvas-components-ignore-artifacts",
        severity: "error",
        from: { path: "^agent-html/components/" },
        to: { path: "^agent-html/artifacts/" }
      }
    ],
    options: {
      doNotFollow: {
        path: "node_modules",
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
          "npm-no-pkg"
        ]
      },
      exclude: { path: "^agent-html/index/" },
      webpackConfig: {
        fileName: "config/dependency-cruiser.react-canvas-resolve.mjs"
      },
      enhancedResolveOptions: {
        conditionNames: ["import", "module", "browser", "default"],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        exportsFields: ["exports"],
        mainFields: ["module", "main", "types"]
      }
    }
  }
}
