import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import { handleRequest, hostRoutes } from "./routes.mjs"

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

describe("dev server routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
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

    const handled = await handleRequest({
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
      "url(https://fontsapi.zeoseven.com/static.woff2)"
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

    const handled = await handleRequest({
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
      "Content-Type": "font/woff2",
    })
    expect(response.body).toEqual(Buffer.from(fontBytes))
  })

  it("rejects non-ZeoSeven font asset proxy urls", async () => {
    const response = createResponseMock()

    const handled = await handleRequest({
      request: {
        url: `${hostRoutes.fontAsset}?url=${encodeURIComponent(
          "https://example.com/font.woff2"
        )}`,
      },
      response,
      root: process.cwd(),
      vite: {},
    })

    expect(handled).toBe(true)
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({
      error: "Only ZeoSeven FontsAPI woff2 URLs are allowed",
    })
  })

  it("rejects non-woff2 font asset proxy urls", async () => {
    const response = createResponseMock()

    const handled = await handleRequest({
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
      error: "Only ZeoSeven FontsAPI woff2 URLs are allowed",
    })
  })

  it("rejects font stylesheet proxy requests without a url", async () => {
    const response = createResponseMock()

    const handled = await handleRequest({
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

  it("rejects non-ZeoSeven font stylesheet proxy urls", async () => {
    const response = createResponseMock()

    const handled = await handleRequest({
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
      error: "Only ZeoSeven FontsAPI result.css URLs are allowed",
    })
  })

  it("renames artifact entry files inside agent-html/artifacts", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-routes-"))
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(
      path.join(artifactsRoot, "old-name.artifact.tsx"),
      "export default function Artifact() { return null }\n"
    )

    const response = createResponseMock()
    const handled = await handleRequest({
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

  it("rejects artifact rename outside artifact entries", async () => {
    const response = createResponseMock()

    const handled = await handleRequest({
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
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-routes-"))
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    const artifactPath = path.join(artifactsRoot, "delete-me.artifact.tsx")
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(artifactPath, "export default function Artifact() {}\n")

    const response = createResponseMock()
    const handled = await handleRequest({
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
})
