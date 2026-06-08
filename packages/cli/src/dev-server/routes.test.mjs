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
})
