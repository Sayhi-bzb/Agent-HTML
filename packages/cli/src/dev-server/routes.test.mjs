import fs from "node:fs/promises"
import path from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import { createTestTempDir } from "../../../../config/test-temp.mjs"
import {
  classifyDevServerRoute,
  devServerRoutePipelines,
  handleRequest,
  hostRoutes,
} from "./routes.mjs"

function createResponseMock() {
  return {
    body: "",
    headers: {},
    statusCode: 0,
    end(content = "") {
      this.body = content
    },
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode
      this.headers = headers
    },
  }
}

function createJsonRequest({ body, url }) {
  return {
    method: "POST",
    url,
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(body))
    },
  }
}

function createArtifactRegistryMock(
  snapshot = {
    artifacts: [],
    diagnostics: [],
    status: "ready",
    version: 1,
  }
) {
  return {
    getSnapshot: vi.fn(() => snapshot),
    refresh: vi.fn(async () => {}),
  }
}

function createCanvasRegistryMock(
  snapshot = {
    canvases: [],
    status: "ready",
    version: 1,
  }
) {
  return {
    getSnapshot: vi.fn(() => snapshot),
    refresh: vi.fn(async () => {}),
  }
}

function handleRoute(options) {
  return handleRequest({
    artifactRegistry: createArtifactRegistryMock(),
    canvasRegistry: createCanvasRegistryMock(),
    ...options,
  })
}

describe("dev server routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("classifies public routes into explicit dev-server pipelines", () => {
    expect(devServerRoutePipelines).toEqual([
      "host-shell",
      "runtime-module",
      "styles-and-assets",
      "public-asset",
      "artifact-registry-and-validation-report",
      "artifact-source-mutation",
      "canvas-registry-and-layout",
      "block-lookup",
      "codex-bridge",
      "runtime-control",
    ])
    expect(classifyDevServerRoute("/")).toBe("host-shell")
    expect(classifyDevServerRoute(hostRoutes.hostEntry)).toBe("runtime-module")
    expect(classifyDevServerRoute(hostRoutes.artifactBundle)).toBe(
      "runtime-module"
    )
    expect(classifyDevServerRoute(hostRoutes.hostStyles)).toBe(
      "styles-and-assets"
    )
    expect(classifyDevServerRoute(hostRoutes.fontAsset)).toBe(
      "styles-and-assets"
    )
    expect(classifyDevServerRoute(`${hostRoutes.publicAsset}ghost.svg`)).toBe(
      "public-asset"
    )
    expect(
      classifyDevServerRoute(
        `${hostRoutes.artifactPublicAsset}demo/public/diagram.svg`
      )
    ).toBe("public-asset")
    expect(classifyDevServerRoute(hostRoutes.artifacts)).toBe(
      "artifact-registry-and-validation-report"
    )
    expect(classifyDevServerRoute(hostRoutes.canvases)).toBe(
      "canvas-registry-and-layout"
    )
    expect(classifyDevServerRoute(hostRoutes.canvasLayout)).toBe(
      "canvas-registry-and-layout"
    )
    expect(classifyDevServerRoute(hostRoutes.artifactRename)).toBe(
      "artifact-source-mutation"
    )
    expect(classifyDevServerRoute(hostRoutes.artifactTitle)).toBe(
      "artifact-source-mutation"
    )
    expect(classifyDevServerRoute(hostRoutes.artifactCreate)).toBe(
      "artifact-source-mutation"
    )
    expect(classifyDevServerRoute(hostRoutes.artifactDelete)).toBe(
      "artifact-source-mutation"
    )
    expect(classifyDevServerRoute(hostRoutes.blockImplementation)).toBe(
      "block-lookup"
    )
    expect(classifyDevServerRoute(hostRoutes.codexTurn)).toBe("codex-bridge")
    expect(classifyDevServerRoute(hostRoutes.runtimeHealth)).toBe(
      "runtime-control"
    )
    expect(classifyDevServerRoute(hostRoutes.runtimeShutdown)).toBe(
      "runtime-control"
    )
    expect(classifyDevServerRoute("/unknown")).toBe(null)
  })

  it("reports runtime health and supervises shutdown", async () => {
    const healthResponse = createResponseMock()
    const requestShutdown = vi.fn()
    const runtimeControl = {
      allowShutdown: true,
      requestShutdown,
      root: "/workspace",
      startedAt: Date.now() - 50,
    }

    await handleRoute({
      request: { method: "GET", url: hostRoutes.runtimeHealth },
      response: healthResponse,
      root: "/workspace",
      runtimeControl,
      vite: {},
    })

    expect(healthResponse.statusCode).toBe(200)
    expect(JSON.parse(healthResponse.body)).toMatchObject({
      ok: true,
      protocolVersion: 1,
      workspaceRoot: "/workspace",
    })

    const shutdownResponse = createResponseMock()
    await handleRoute({
      request: { method: "POST", url: hostRoutes.runtimeShutdown },
      response: shutdownResponse,
      root: "/workspace",
      runtimeControl,
      vite: {},
    })
    await new Promise((resolve) => setImmediate(resolve))

    expect(shutdownResponse.statusCode).toBe(200)
    expect(requestShutdown).toHaveBeenCalledOnce()
  })

  it("serves global and artifact-local public assets", async () => {
    const root = await createTestTempDir("routes")
    await fs.mkdir(path.join(root, "agent-html", "public"), { recursive: true })
    await fs.mkdir(
      path.join(root, "agent-html", "artifacts", "demo", "public"),
      {
        recursive: true,
      }
    )
    await fs.writeFile(
      path.join(root, "agent-html", "public", "global.txt"),
      "global"
    )
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo", "public", "local.svg"),
      "<svg />"
    )

    const globalResponse = createResponseMock()
    const globalHandled = await handleRoute({
      request: { url: `${hostRoutes.publicAsset}global.txt` },
      response: globalResponse,
      root,
      vite: {},
    })

    expect(globalHandled).toBe(true)
    expect(globalResponse.statusCode).toBe(200)
    expect(globalResponse.headers).toMatchObject({
      "Content-Type": "text/plain; charset=utf-8",
    })
    expect(globalResponse.body).toEqual(Buffer.from("global"))

    const artifactResponse = createResponseMock()
    const artifactHandled = await handleRoute({
      request: {
        url: `${hostRoutes.artifactPublicAsset}demo/public/local.svg`,
      },
      response: artifactResponse,
      root,
      vite: {},
    })

    expect(artifactHandled).toBe(true)
    expect(artifactResponse.statusCode).toBe(200)
    expect(artifactResponse.headers).toMatchObject({
      "Content-Type": "image/svg+xml",
    })
    expect(artifactResponse.body).toEqual(Buffer.from("<svg />"))
  })

  it("returns 404 for missing artifact-local public assets", async () => {
    const root = await createTestTempDir("routes")
    const response = createResponseMock()

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.artifactPublicAsset}demo/public/missing.svg`,
      },
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body)).toEqual({ error: "Not found" })
  })

  it("rejects artifact-local public asset traversal", async () => {
    const root = await createTestTempDir("routes")
    const response = createResponseMock()

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.artifactPublicAsset}demo/public/%2e%2e%2fAGENTS.md`,
      },
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain(
      "Artifact public asset path must stay inside artifact public directory"
    )
  })

  it("proxies allowed ZeoSeven font stylesheets", async () => {
    const response = createResponseMock()
    const fontCss = [
      '@font-face { src: url("./quoted.woff2") format("woff2"); }',
      "@font-face { src: url('./single-quoted.woff2') format('woff2'); }",
      "@font-face { src: url(unquoted.woff2) format('woff2'); }",
      "@font-face { src: url(https://fontsapi.zeoseven.com/static.woff2); }",
    ].join("\n")
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => fontCss,
    }))

    vi.stubGlobal("fetch", fetchMock)

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.fontStylesheet}?url=${encodeURIComponent(
          "https://fontsapi.zeoseven.com/570/main/result.css"
        )}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fontsapi.zeoseven.com/570/main/result.css"
    )
    expect(response.statusCode).toBe(200)
    expect(response.headers).toMatchObject({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/css; charset=utf-8",
    })
    expect(response.body).toContain(
      'url("/__agent-html/font-asset?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F570%2Fmain%2Fquoted.woff2")'
    )
    expect(response.body).toContain(
      'url("/__agent-html/font-asset?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F570%2Fmain%2Fsingle-quoted.woff2")'
    )
    expect(response.body).toContain(
      'url("/__agent-html/font-asset?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F570%2Fmain%2Funquoted.woff2")'
    )
    expect(response.body).toContain(
      'url("/__agent-html/font-asset?url=https%3A%2F%2Ffontsapi.zeoseven.com%2Fstatic.woff2")'
    )
  })

  it("proxies Google font stylesheets and gstatic assets", async () => {
    const response = createResponseMock()
    const fontUrl = "https://fonts.gstatic.com/s/inter/v20/test.woff2"
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => `@font-face { src: url(${fontUrl}) format('woff2'); }`,
    }))

    vi.stubGlobal("fetch", fetchMock)

    const stylesheetUrl =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
    await handleRoute({
      request: {
        url: `${hostRoutes.fontStylesheet}?url=${encodeURIComponent(stylesheetUrl)}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(fetchMock).toHaveBeenCalledWith(stylesheetUrl)
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain(
      `url("${hostRoutes.fontAsset}?url=${encodeURIComponent(fontUrl)}")`
    )
  })

  it("proxies allowed ZeoSeven font assets", async () => {
    const response = createResponseMock()
    const fontBytes = new Uint8Array([1, 2, 3]).buffer
    const fetchMock = vi.fn(async () => ({
      arrayBuffer: async () => fontBytes,
      ok: true,
      status: 200,
    }))

    vi.stubGlobal("fetch", fetchMock)

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.fontAsset}?url=${encodeURIComponent(
          "https://fontsapi.zeoseven.com/570/main/test.woff2"
        )}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fontsapi.zeoseven.com/570/main/test.woff2"
    )
    expect(response.statusCode).toBe(200)
    expect(response.headers).toMatchObject({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "font/woff2",
    })
    expect(response.body).toEqual(Buffer.from(fontBytes))
  })

  it("proxies allowed gstatic woff2 assets", async () => {
    const response = createResponseMock()
    const fontBytes = new Uint8Array([4, 5, 6]).buffer
    const fontUrl = "https://fonts.gstatic.com/s/inter/v20/test.woff2"
    const fetchMock = vi.fn(async () => ({
      arrayBuffer: async () => fontBytes,
      ok: true,
      status: 200,
    }))

    vi.stubGlobal("fetch", fetchMock)

    await handleRoute({
      request: {
        url: `${hostRoutes.fontAsset}?url=${encodeURIComponent(fontUrl)}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(fetchMock).toHaveBeenCalledWith(fontUrl)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(Buffer.from(fontBytes))
  })

  it("rejects non-approved font asset proxy urls", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.fontAsset}?url=${encodeURIComponent("https://example.com/font.woff2")}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({
      error: "Only approved woff2 font asset URLs are allowed",
    })
  })

  it("rejects non-woff2 font asset proxy urls", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.fontAsset}?url=${encodeURIComponent(
          "https://fontsapi.zeoseven.com/570/main/result.css"
        )}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({
      error: "Only approved woff2 font asset URLs are allowed",
    })
  })

  it("returns JSON 404 for unknown internal AgentHTML routes", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: { url: "/__agent-html/missing-route" },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(404)
    expect(response.headers).toEqual({
      "Content-Type": "application/json; charset=utf-8",
    })
    expect(JSON.parse(response.body)).toEqual({ error: "Not found" })
  })

  it("rejects font stylesheet proxy requests without a url", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: { url: hostRoutes.fontStylesheet },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({
      error: "url is required",
    })
  })

  it("rejects non-approved font stylesheet proxy urls", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.fontStylesheet}?url=${encodeURIComponent(
          "https://example.com/font.css"
        )}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({
      error: "Only approved font stylesheet URLs are allowed",
    })
  })

  it("serves artifacts from the registry snapshot", async () => {
    const response = createResponseMock()
    const snapshot = {
      artifacts: [
        {
          blocks: [{ id: "summary", title: "Summary" }],
          filePath: "agent-html/artifacts/demo.artifact.tsx",
        },
      ],
      diagnostics: [],
      status: "ready",
      version: 7,
    }
    const artifactRegistry = createArtifactRegistryMock(snapshot)

    const handled = await handleRequest({
      artifactRegistry,
      request: { url: hostRoutes.artifacts },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(artifactRegistry.getSnapshot).toHaveBeenCalledOnce()
    expect(JSON.parse(response.body)).toEqual(snapshot)
  })

  it("serves canvases from the dedicated registry snapshot", async () => {
    const response = createResponseMock()
    const snapshot = {
      canvases: [
        {
          filePath: "agent-html/canvases/demo.canvas.tsx",
          layoutPath: "agent-html/canvases/demo.layout.json",
          title: "Demo",
        },
      ],
      status: "ready",
      version: 3,
    }
    const canvasRegistry = createCanvasRegistryMock(snapshot)

    await handleRequest({
      artifactRegistry: createArtifactRegistryMock(),
      canvasRegistry,
      request: { method: "GET", url: hostRoutes.canvases },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(canvasRegistry.getSnapshot).toHaveBeenCalledOnce()
    expect(JSON.parse(response.body)).toEqual(snapshot)
  })

  it("returns an empty layout then persists a Canvas layout round trip", async () => {
    const root = await createTestTempDir("canvas-layout")
    const canvasesRoot = path.join(root, "agent-html", "canvases")
    const filePath = "agent-html/canvases/demo.canvas.tsx"
    await fs.mkdir(canvasesRoot, { recursive: true })
    await fs.writeFile(
      path.join(canvasesRoot, "demo.canvas.tsx"),
      "export default function Demo() { return null }\n"
    )

    const missingResponse = createResponseMock()
    await handleRoute({
      request: {
        method: "GET",
        url: `${hostRoutes.canvasLayout}?filePath=${encodeURIComponent(filePath)}`,
      },
      response: missingResponse,
      root,
      vite: {},
    })
    expect(JSON.parse(missingResponse.body)).toEqual({
      layout: { nodes: {}, version: 1 },
      layoutPath: "agent-html/canvases/demo.layout.json",
    })

    const layout = {
      nodes: {
        card: { height: 240, width: 360, x: -20, y: 48 },
      },
      version: 1,
    }
    const saveResponse = createResponseMock()
    await handleRoute({
      request: createJsonRequest({
        body: { filePath, layout },
        url: hostRoutes.canvasLayout,
      }),
      response: saveResponse,
      root,
      vite: {},
    })
    expect(JSON.parse(saveResponse.body).layout).toEqual(layout)

    const updatedLayout = {
      nodes: {
        card: { height: 280, width: 400, x: 72, y: -16 },
      },
      version: 1,
    }
    const updateResponse = createResponseMock()
    await handleRoute({
      request: createJsonRequest({
        body: { filePath, layout: updatedLayout },
        url: hostRoutes.canvasLayout,
      }),
      response: updateResponse,
      root,
      vite: {},
    })
    expect(JSON.parse(updateResponse.body).layout).toEqual(updatedLayout)

    const restartResponse = createResponseMock()
    await handleRoute({
      request: {
        method: "GET",
        url: `${hostRoutes.canvasLayout}?filePath=${encodeURIComponent(filePath)}`,
      },
      response: restartResponse,
      root,
      vite: {},
    })
    expect(JSON.parse(restartResponse.body).layout).toEqual(updatedLayout)
  })

  it("rejects Canvas layout traversal outside agent-html/canvases", async () => {
    const response = createResponseMock()
    await handleRoute({
      request: {
        method: "GET",
        url: `${hostRoutes.canvasLayout}?filePath=${encodeURIComponent(
          "agent-html/canvases/../escape.canvas.tsx"
        )}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain(
      "agent-html/canvases/**/*.canvas.tsx"
    )
  })

  it("transforms Canvas bundles through the private Vite entry", async () => {
    const response = createResponseMock()
    const transformRequest = vi.fn(async () => ({ code: "export default 1" }))
    const filePath = "agent-html/canvases/demo.canvas.tsx"

    await handleRoute({
      request: {
        method: "GET",
        url: `${hostRoutes.canvasBundle}?filePath=${encodeURIComponent(filePath)}&v=7`,
      },
      response,
      root: process.cwd(),
      vite: { transformRequest },
    })

    expect(transformRequest).toHaveBeenCalledWith(
      expect.stringContaining(
        "/__agent-html/vite-canvas-entry.js?filePath=agent-html%2Fcanvases%2Fdemo.canvas.tsx&v=7"
      )
    )
    expect(response.body).toBe("export default 1")
  })

  it("refreshes the artifact registry before serving pending polling snapshots", async () => {
    const response = createResponseMock()
    const snapshot = {
      artifacts: [
        {
          blocks: [{ id: "pending", title: "Pending" }],
          filePath: "agent-html/artifacts/pending.artifact.tsx",
        },
      ],
      diagnostics: [],
      status: "ready",
      version: 8,
    }
    const artifactRegistry = createArtifactRegistryMock(snapshot)

    const handled = await handleRequest({
      artifactRegistry,
      request: { url: `${hostRoutes.artifacts}?refresh=1` },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(artifactRegistry.refresh).toHaveBeenCalledWith({
      broadcast: false,
      reason: "artifact-poll",
    })
    expect(artifactRegistry.getSnapshot).toHaveBeenCalledOnce()
    expect(JSON.parse(response.body)).toEqual(snapshot)
  })

  it("creates artifact entry files inside agent-html/artifacts", async () => {
    const root = await createTestTempDir("routes")
    const artifactRegistry = createArtifactRegistryMock()
    const response = createResponseMock()

    const handled = await handleRequest({
      artifactRegistry,
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/build-dashboard.artifact.tsx",
          request: "Build a dashboard",
        },
        url: hostRoutes.artifactCreate,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(JSON.parse(response.body)).toEqual({
      filePath: "agent-html/artifacts/build-dashboard.artifact.tsx",
    })
    await expect(
      fs.readFile(
        path.join(
          root,
          "agent-html",
          "artifacts",
          "build-dashboard.artifact.tsx"
        ),
        "utf8"
      )
    ).resolves.toContain("defineArtifact")
    await expect(
      fs.readFile(
        path.join(
          root,
          "agent-html",
          "artifacts",
          "build-dashboard",
          "overview.block.tsx"
        ),
        "utf8"
      )
    ).resolves.toContain("export default function OverviewBlock")
    expect(artifactRegistry.refresh).toHaveBeenCalledWith({
      reason: "artifact-create",
    })
  })

  it("rejects artifact create when the target file exists", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(
      path.join(artifactsRoot, "existing.artifact.tsx"),
      "export default function Existing() { return null }\n"
    )

    const response = createResponseMock()
    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/existing.artifact.tsx",
          request: "Replace it",
        },
        url: hostRoutes.artifactCreate,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain(
      "Artifact file already exists"
    )
  })

  it("rejects artifact create outside artifact entries", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/AGENTS.md",
          request: "Build a dashboard",
        },
        url: hostRoutes.artifactCreate,
      }),
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain(
      "agent-html/artifacts/*.artifact.tsx"
    )
  })

  it("reports host entry transform failures with Vite details", async () => {
    const response = createResponseMock()
    const error = new Error("spawn EPERM")
    error.plugin = "vite:esbuild"
    error.id = "D:/codes/Agent-HTML/packages/cli/src/host/main.tsx"
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const handled = await handleRoute({
      request: { url: hostRoutes.hostEntry },
      response,
      root: process.cwd(),
      vite: {
        transformRequest: vi.fn(async () => {
          throw error
        }),
      },
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(500)
    const body = JSON.parse(response.body)
    expect(body.error).toContain("Unable to transform module")
    expect(body.error).toContain("packages/cli/src/host/main.tsx")
    expect(body.error).toContain("spawn EPERM")
    expect(body.error).toContain("Plugin: vite:esbuild")
    expect(body.error).toContain("agent-html-vite")
    expect(consoleError).toHaveBeenCalledWith(
      "[agent-html] module transform failed\n%s",
      body.error
    )
  })

  it("reports artifact bundle transform failures with artifact context", async () => {
    const response = createResponseMock()
    const filePath = "agent-html/artifacts/demo.artifact.tsx"
    vi.spyOn(console, "error").mockImplementation(() => {})

    const handled = await handleRoute({
      request: {
        url: `${hostRoutes.artifactBundle}?filePath=${encodeURIComponent(filePath)}`,
      },
      response,
      root: process.cwd(),
      vite: {
        transformRequest: vi.fn(async () => {
          throw new Error("Unexpected token")
        }),
      },
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(500)
    const body = JSON.parse(response.body)
    expect(body.error).toContain("Unable to transform module")
    expect(body.error).toContain("/__agent-html/vite-artifact-entry.js")
    expect(body.error).toContain(encodeURIComponent(filePath))
    expect(body.error).toContain("Unexpected token")
  })

  it("passes artifact bundle version through to the virtual module id", async () => {
    const response = createResponseMock()
    const filePath = "agent-html/artifacts/demo.artifact.tsx"
    const transformRequest = vi.fn(async () => "export {}")

    const handled = await handleRoute({
      request: {
        url:
          `${hostRoutes.artifactBundle}?filePath=${encodeURIComponent(filePath)}` +
          "&v=42",
      },
      response,
      root: process.cwd(),
      vite: {
        transformRequest,
      },
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(200)
    expect(transformRequest).toHaveBeenCalledWith(
      `${hostRoutes.artifactBundle.replace(
        "artifact.js",
        "vite-artifact-entry.js"
      )}?filePath=${encodeURIComponent(filePath)}&v=42`
    )
  })

  it("renames artifact entry files inside agent-html/artifacts", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(
      path.join(artifactsRoot, "old-name.artifact.tsx"),
      "export default function Artifact() { return null }\n"
    )

    const response = createResponseMock()
    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/old-name.artifact.tsx",
          nextFileName: "new-name",
        },
        url: hostRoutes.artifactRename,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(JSON.parse(response.body)).toEqual({
      filePath: "agent-html/artifacts/new-name.artifact.tsx",
    })
    await expect(
      fs.readFile(path.join(artifactsRoot, "new-name.artifact.tsx"), "utf8")
    ).resolves.toContain("export default")
  })

  it("renames an artifact title without renaming its source unit", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    const artifactPath = path.join(artifactsRoot, "demo.artifact.tsx")
    const source = [
      'const untouched = "Old title"',
      'export default defineArtifact({ title: "Old title", blocks: ["summary"] })',
      "",
    ].join("\n")
    await fs.mkdir(path.join(artifactsRoot, "demo"), { recursive: true })
    await fs.writeFile(artifactPath, source)

    const artifactRegistry = createArtifactRegistryMock()
    const response = createResponseMock()
    const handled = await handleRoute({
      artifactRegistry,
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/demo.artifact.tsx",
          title: "  New title  ",
        },
        url: hostRoutes.artifactTitle,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(JSON.parse(response.body)).toEqual({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      title: "New title",
    })
    await expect(fs.readFile(artifactPath, "utf8")).resolves.toBe(
      source.replace('title: "Old title"', 'title: "New title"')
    )
    await expect(
      fs.stat(path.join(artifactsRoot, "demo"))
    ).resolves.toBeDefined()
    expect(artifactRegistry.refresh).toHaveBeenCalledWith({
      reason: "artifact-title-rename",
    })
  })

  it("rejects a dynamic artifact title without writing the file", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    const artifactPath = path.join(artifactsRoot, "demo.artifact.tsx")
    const source =
      'export default defineArtifact({ title: artifactTitle, blocks: ["summary"] })\n'
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(artifactPath, source)

    const response = createResponseMock()
    const handled = await handleRoute({
      artifactRegistry: createArtifactRegistryMock(),
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/demo.artifact.tsx",
          title: "New title",
        },
        url: hostRoutes.artifactTitle,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain("missing a static title")
    await expect(fs.readFile(artifactPath, "utf8")).resolves.toBe(source)
  })

  it("renames matching artifact block directories", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    const sourceBlockDirectory = path.join(artifactsRoot, "old-name")
    const targetBlockDirectory = path.join(artifactsRoot, "new-name")
    await fs.mkdir(sourceBlockDirectory, { recursive: true })
    await fs.writeFile(
      path.join(artifactsRoot, "old-name.artifact.tsx"),
      "export default function Artifact() { return null }\n"
    )
    await fs.writeFile(
      path.join(sourceBlockDirectory, "summary.block.tsx"),
      "export function SummaryBlock() { return null }\n"
    )

    const response = createResponseMock()
    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/old-name.artifact.tsx",
          nextFileName: "new-name",
        },
        url: hostRoutes.artifactRename,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(JSON.parse(response.body)).toEqual({
      filePath: "agent-html/artifacts/new-name.artifact.tsx",
    })
    await expect(fs.stat(sourceBlockDirectory)).rejects.toThrow()
    await expect(
      fs.readFile(path.join(targetBlockDirectory, "summary.block.tsx"), "utf8")
    ).resolves.toContain("SummaryBlock")
  })

  it("rejects artifact rename when the target block directory exists", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    await fs.mkdir(path.join(artifactsRoot, "new-name"), { recursive: true })
    await fs.writeFile(
      path.join(artifactsRoot, "old-name.artifact.tsx"),
      "export default function Artifact() { return null }\n"
    )

    const response = createResponseMock()
    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/old-name.artifact.tsx",
          nextFileName: "new-name",
        },
        url: hostRoutes.artifactRename,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain(
      "Artifact block directory already exists"
    )
    await expect(
      fs.readFile(path.join(artifactsRoot, "old-name.artifact.tsx"), "utf8")
    ).resolves.toContain("export default")
  })

  it("rejects artifact rename outside artifact entries", async () => {
    const response = createResponseMock()

    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/AGENTS.md",
          nextFileName: "renamed",
        },
        url: hostRoutes.artifactRename,
      }),
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error).toContain(
      "agent-html/artifacts/*.artifact.tsx"
    )
  })

  it("deletes artifact entry files inside agent-html/artifacts", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    const artifactPath = path.join(artifactsRoot, "delete-me.artifact.tsx")
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(artifactPath, "export default function Artifact() {}\n")

    const response = createResponseMock()
    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/delete-me.artifact.tsx",
        },
        url: hostRoutes.artifactDelete,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(JSON.parse(response.body)).toEqual({ ok: true })
    await expect(fs.stat(artifactPath)).rejects.toThrow()
  })

  it("deletes matching artifact block directories", async () => {
    const root = await createTestTempDir("routes")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    const artifactPath = path.join(artifactsRoot, "delete-me.artifact.tsx")
    const blockDirectory = path.join(artifactsRoot, "delete-me")
    await fs.mkdir(blockDirectory, { recursive: true })
    await fs.writeFile(artifactPath, "export default function Artifact() {}\n")
    await fs.writeFile(
      path.join(blockDirectory, "summary.block.tsx"),
      "export function SummaryBlock() { return null }\n"
    )

    const response = createResponseMock()
    const handled = await handleRoute({
      request: createJsonRequest({
        body: {
          filePath: "agent-html/artifacts/delete-me.artifact.tsx",
        },
        url: hostRoutes.artifactDelete,
      }),
      response,
      root,
      vite: {},
    })

    expect(handled).toBe(true)
    expect(JSON.parse(response.body)).toEqual({ ok: true })
    await expect(fs.stat(artifactPath)).rejects.toThrow()
    await expect(fs.stat(blockDirectory)).rejects.toThrow()
  })
})
