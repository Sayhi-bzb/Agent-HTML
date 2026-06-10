import fs from "node:fs/promises"
import { execFile, spawn } from "node:child_process"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"

import { describe, expect, it } from "vitest"

import { startDevHost } from "./dev-host.mjs"
import { hostRoot, packageRoot } from "./dev-server/context.mjs"
import { parsePipelineArg } from "./dev-server/server.mjs"
import {
  createHostEntryModule,
  createPlaygroundDependencyAliases,
  createReactModuleResolutionAliases,
  createViteFsAllowList,
  resolvePackageImportModule,
} from "./dev-server/vite.mjs"

const reactPackageRoot = path.resolve(packageRoot, "..", "react")
const execFileAsync = promisify(execFile)

async function execNpm(args, options) {
  if (process.env.npm_execpath) {
    return execFileAsync(process.execPath, [process.env.npm_execpath, ...args], {
      ...options,
      windowsHide: true,
    })
  }

  const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm"
  return execFileAsync(npmExecutable, args, { ...options, windowsHide: true })
}

async function listenOnPort(port) {
  const server = http.createServer()

  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(port, "127.0.0.1", resolve)
  })

  return server
}

async function listenOnFreePort() {
  const server = await listenOnPort(0)
  const address = server.address()

  if (!address || typeof address === "string") {
    throw new Error("Unable to allocate a test port")
  }

  return {
    port: address.port,
    server,
  }
}

async function closeServer(server) {
  await new Promise((resolve) => server.close(resolve))
}

async function reserveFreePort() {
  const { port, server } = await listenOnFreePort()
  await closeServer(server)
  return port
}

function viteFsPath(filePath) {
  return `/@fs/${path.resolve(filePath).replaceAll(path.sep, "/")}`
}

async function waitForDevHost(url, child, output, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `agent-html dev exited early with code ${child.exitCode}\n${output()}`
      )
    }

    try {
      const response = await fetch(url)

      if (response.ok) {
        return
      }
    } catch {
      // Keep polling until the host starts or the timeout expires.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for ${url}\n${output()}`)
}

function parseNpmPackOutput(output) {
  const start = output.indexOf("[")
  const end = output.lastIndexOf("]")

  if (start === -1 || end === -1) {
    throw new Error(`Unable to parse npm pack output:\n${output}`)
  }

  return JSON.parse(output.slice(start, end + 1))
}

async function packPackage({ cwd, packDirectory }) {
  const { stdout } = await execNpm(
    ["pack", "--json", "--pack-destination", packDirectory],
    { cwd }
  )
  const [{ filename }] = parseNpmPackOutput(stdout)

  return path.join(packDirectory, filename)
}

const devHostIntegrationTimeout = 60_000
const packageInstallSmokeTimeout = 180_000

describe("React Canvas dev host", () => {
  it("parses explicit host pipeline modes", () => {
    expect(parsePipelineArg([])).toBe("codex")
    expect(parsePipelineArg(["--pipeline", "codex"])).toBe("codex")
    expect(parsePipelineArg(["--pipeline", "example"])).toBe("example")
    expect(() => parsePipelineArg(["--pipeline", "test"])).toThrow(
      "--pipeline requires either codex or example"
    )
  })

  it("injects the selected pipeline into the host entry module", () => {
    expect(createHostEntryModule()).toContain('"pipeline":"codex"')
    expect(createHostEntryModule({ pipeline: "example" })).toContain(
      '"pipeline":"example"'
    )
    expect(createHostEntryModule({ pipeline: "example" })).toContain(
      '"contentSource":"artifacts"'
    )
  })

  it("pins React module resolution to one canonical renderer instance", () => {
    const aliases = createReactModuleResolutionAliases()

    expect(aliases).toEqual([
      {
        find: "react-dom/client",
        replacement: expect.stringContaining("react-dom"),
      },
      {
        find: "react/jsx-runtime",
        replacement: expect.stringContaining("react"),
      },
      {
        find: "react/jsx-dev-runtime",
        replacement: expect.stringContaining("react"),
      },
      {
        find: /^react$/,
        replacement: expect.stringContaining("react"),
      },
    ])
    expect(aliases.map((alias) => String(alias.find))).toEqual([
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "/^react$/",
    ])
  })

  it("pins playground dependencies outside the source workspace", () => {
    const aliases = createPlaygroundDependencyAliases(process.cwd())
    const radixAlias = aliases.find(
      (alias) => String(alias.find) === "/^radix-ui$/"
    )
    const clsxAlias = aliases.find((alias) => String(alias.find) === "/^clsx$/")
    const tailwindMergeAlias = aliases.find(
      (alias) => String(alias.find) === "/^tailwind-merge$/"
    )
    const cvaAlias = aliases.find(
      (alias) => String(alias.find) === "/^class-variance-authority$/"
    )

    expect(radixAlias).toEqual({
      find: /^radix-ui$/,
      replacement: expect.stringContaining("node_modules"),
    })
    expect(radixAlias.replacement.replaceAll("\\", "/")).not.toContain(
      "/agent-html/node_modules/"
    )
    expect(clsxAlias.replacement.replaceAll("\\", "/")).toContain(
      "/node_modules/clsx/dist/clsx.mjs"
    )
    expect(tailwindMergeAlias.replacement.replaceAll("\\", "/")).toContain(
      "/node_modules/tailwind-merge/dist/bundle-mjs.mjs"
    )
    expect(cvaAlias.replacement.replaceAll("\\", "/")).toContain(
      "/node_modules/class-variance-authority/dist/index.mjs"
    )
  })

  it("resolves playground package imports with ESM import entries first", () => {
    expect(resolvePackageImportModule("clsx").replaceAll("\\", "/")).toContain(
      "/node_modules/clsx/dist/clsx.mjs"
    )
    expect(
      resolvePackageImportModule("tailwind-merge").replaceAll("\\", "/")
    ).toContain("/node_modules/tailwind-merge/dist/bundle-mjs.mjs")
  })

  it("scans and renders the example artifact", async () => {
    const { server, url } = await startDevHost({
      args: ["--port", "5298"],
      cwd: process.cwd(),
    })

    try {
      const artifacts = await fetch(`${url}/__agent-html/artifacts`).then((response) =>
        response.json()
      )
      expect(artifacts.artifacts).toContainEqual(
        expect.objectContaining({
          blocks: [
            { id: "orion-window", title: "Orion Window" },
            { id: "crew-manifest", title: "Crew Manifest" },
            { id: "system-ignition", title: "System Ignition" },
            { id: "mission-route", title: "Nine-Day Mission Route" },
            { id: "lunar-flyby", title: "Lunar Flyby" },
            { id: "return-future", title: "Return And Future" },
            { id: "sources", title: "Sources" },
          ],
          filePath: "agent-html/artifacts/nasa-artemis-ii.artifact.tsx",
        })
      )

      const removedRender = await fetch(`${url}/__agent-html/render`)
      expect(removedRender.status).toBe(404)

      const removedShell = await fetch(`${url}/__agent-html/host-shell`)
      expect(removedShell.status).toBe(404)

      const removedClient = await fetch(`${url}/client.js`)
      expect(removedClient.status).toBe(404)

      const removedStyles = await fetch(`${url}/styles.css`)
      expect(removedStyles.status).toBe(404)

      const html = await fetch(url).then((response) => response.text())
      expect(html).toContain("<title>Agent-HTML</title>")
      expect(html).toContain(
        '<link rel="icon" href="/__agent-html/public/ghost.svg" type="image/svg+xml" />'
      )
      expect(html).toContain("/@vite/client")
      expect(html).toContain("/__agent-html/host-entry.js")

      const removedHostBundle = await fetch(`${url}/__agent-html/host.js`)
      expect(removedHostBundle.status).toBe(404)

      const hostEntry = await fetch(`${url}/__agent-html/host-entry.js`).then((response) =>
        response.text()
      )
      expect(hostEntry).toContain("packages/cli/src/host/main.tsx")

      const hostMain = await fetch(
        `${url}${viteFsPath(path.join(hostRoot, "main.tsx"))}`
      ).then((response) => response.text())
      expect(hostMain).not.toContain("/node_modules/react-dom/client.js")

      const removedBundle = await fetch(`${url}/__agent-html/client-bundle`)
      expect(removedBundle.status).toBe(404)

      const removedBlockSource = await fetch(`${url}/__agent-html/block-source`)
      expect(removedBlockSource.status).toBe(404)

      const publicFile = await fetch(`${url}/__agent-html/public/.gitkeep`)
      expect(publicFile.status).toBe(200)

      const publicMissing = await fetch(`${url}/__agent-html/public/missing.txt`)
      expect(publicMissing.status).toBe(404)

      const publicTraversal = await fetch(`${url}/__agent-html/public/../AGENTS.md`)
      expect(publicTraversal.status).toBe(404)

      const publicEncodedTraversal = await fetch(
        `${url}/__agent-html/public/%2e%2e%2fAGENTS.md`
      )
      expect(publicEncodedTraversal.status).toBe(400)

      const blockImplementationUrl = new URL(`${url}/__agent-html/block-implementation`)
      blockImplementationUrl.searchParams.set(
        "filePath",
        "agent-html/examples/example.artifact.tsx"
      )
      blockImplementationUrl.searchParams.set("blockId", "brief")
      const blockImplementation = await fetch(blockImplementationUrl).then((response) =>
        response.json()
      )
      expect(blockImplementation.implementationPath).toBe(
        "agent-html/examples/example/brief.block.tsx"
      )
      expect(Object.keys(blockImplementation).sort()).toEqual(["implementationPath"])

      const bundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      bundleUrl.searchParams.set(
        "filePath",
        "agent-html/artifacts/nasa-artemis-ii.artifact.tsx"
      )
      const bundle = await fetch(bundleUrl).then((response) => response.text())
      expect(bundle).toContain("function mount")
      expect(bundle).toContain("import.meta.hot")
      expect(bundle).not.toContain("/node_modules/react-dom/client.js")
      expect(bundle).toContain(
        "/agent-html/artifacts/nasa-artemis-ii.artifact.tsx"
      )

      const appSourceBundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      appSourceBundleUrl.searchParams.set("filePath", "package.json")
      const appSourceBundle = await fetch(appSourceBundleUrl)
      expect(appSourceBundle.status).toBe(400)

      const appSourceBlockUrl = new URL(`${url}/__agent-html/block-implementation`)
      appSourceBlockUrl.searchParams.set("filePath", "package.json")
      appSourceBlockUrl.searchParams.set("blockId", "summary")
      const appSourceBlock = await fetch(appSourceBlockUrl)
      expect(appSourceBlock.status).toBe(400)

      const css = await fetch(`${url}/__agent-html/styles.css`).then((response) =>
        response.text()
      )
      expect(css).toContain("--primary")
      expect(css).toContain("--sidebar-primary")
      expect(css).not.toContain("--window-chrome-radius")
      expect(css).toContain(".bg-primary")
      expect(css).toContain(".bg-sidebar")
      expect(css).toContain("--canvas-artifact-max-width")
      expect(css).toContain("--canvas-artifact-block-gap")
      expect(css).toContain("--canvas-surface-padding-inline")
      expect(css).toContain("--canvas-toolbar-inset-block-start")
      expect(css).toContain("--canvas-block-reply-badge-offset")
      expect(css).toContain("--canvas-floating-prompt-width")
      expect(css).not.toContain("--canvas-artifact-skeleton-max-width")
      expect(css).toContain("--canvas-content-gap-md")
      expect(css).toContain("--canvas-content-panel-padding-md")
      expect(css).toContain("--canvas-content-body-font-size")
      expect(css).toContain("--canvas-theme-editor-popover-width-lg")
      expect(css).toContain(".agent-html-artifact")
      expect(css).toContain(".canvas-surface-frame")
      expect(css).toContain(".canvas-artifact-skeleton")
      expect(css).toContain(".canvas-block-action-badge")
      expect(css).toContain(".canvas-floating-prompt")
      expect(css).toContain(".canvas-content-panel")
      expect(css).toContain(".canvas-text-body")
      expect(css).toContain(".canvas-theme-editor-popover-label")
      expect(css).toContain(".text-popover-foreground")
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  }, devHostIntegrationTimeout)

  it("serves the example pipeline while reusing artifact content", async () => {
    const { pipeline, server, url } = await startDevHost({
      args: ["--port", String(await reserveFreePort()), "--pipeline", "example"],
      cwd: process.cwd(),
    })

    try {
      expect(pipeline).toBe("example")

      const artifacts = await fetch(`${url}/__agent-html/artifacts`).then(
        (response) => response.json()
      )
      expect(artifacts.artifacts).toContainEqual(
        expect.objectContaining({
          filePath: "agent-html/artifacts/nasa-artemis-ii.artifact.tsx",
        })
      )

      const hostEntry = await fetch(`${url}/__agent-html/host-entry.js`).then(
        (response) => response.text()
      )
      expect(hostEntry).toContain('"pipeline":"example"')
      expect(hostEntry).toContain('"contentSource":"artifacts"')
    } finally {
      await closeServer(server)
    }
  }, devHostIntegrationTimeout)


  it("uses another port when the default port is occupied", async () => {
    let defaultPortBlocker = null

    try {
      defaultPortBlocker = await listenOnPort(5177)
    } catch (error) {
      if (!error || error.code !== "EADDRINUSE") {
        throw error
      }
    }

    const { server, url } = await startDevHost({
      args: [],
      cwd: process.cwd(),
    })

    try {
      expect(url).not.toBe("http://127.0.0.1:5177")
      const artifacts = await fetch(`${url}/__agent-html/artifacts`).then(
        (response) => response.json()
      )
      expect(artifacts.artifacts.length).toBeGreaterThan(0)
    } finally {
      await closeServer(server)
      if (defaultPortBlocker) {
        await closeServer(defaultPortBlocker)
      }
    }
  }, devHostIntegrationTimeout)

  it("reports a clear error when an explicit port is occupied", async () => {
    const { port, server } = await listenOnFreePort()

    try {
      await expect(
        startDevHost({
          args: ["--port", String(port)],
          cwd: process.cwd(),
        })
      ).rejects.toThrow(
        `Port ${port} is already in use. Try agent-html dev --port <other-port>.`
      )
    } finally {
      await closeServer(server)
    }
  }, 30_000)

  it("serves dependency modules without allowing project source", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-deps-"))
    const dependencyPath = path.join(
      root,
      "node_modules",
      "fake-agent-html-dep",
      "index.js"
    )
    const appSourcePath = path.join(root, "app-source.js")

    await fs.mkdir(path.dirname(dependencyPath), { recursive: true })
    await fs.mkdir(path.join(root, "agent-html"), { recursive: true })
    await fs.writeFile(dependencyPath, "export const label = 'dependency';\n")
    await fs.writeFile(appSourcePath, "export const label = 'app-source';\n")

    expect(
      createViteFsAllowList({
        reactProtocolEntry: path.join(
          root,
          "node_modules",
          "@agent-html",
          "react",
          "src",
          "index.tsx"
        ),
        root,
      })
    ).toEqual(
      expect.arrayContaining([
        path.resolve(root, "agent-html"),
        path.resolve(root, "node_modules"),
      ])
    )
    expect(
      createViteFsAllowList({
        reactProtocolEntry: path.join(
          root,
          "node_modules",
          "@agent-html",
          "react",
          "src",
          "index.tsx"
        ),
        root,
      })
    ).not.toContain(path.resolve(root))

    const { server, url } = await startDevHost({
      args: ["--port", String(await reserveFreePort())],
      cwd: root,
    })

    try {
      const dependency = await fetch(`${url}${viteFsPath(dependencyPath)}`)
      expect(dependency.status).toBe(200)
      await expect(dependency.text()).resolves.toContain("dependency")

      const appSource = await fetch(`${url}${viteFsPath(appSourcePath)}`)
      expect(appSource.status).not.toBe(200)
    } finally {
      await closeServer(server)
    }
  }, 30_000)

  it("runs from the packed npm package in a fresh project", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-package-"))
    const packDirectory = path.join(root, "pack")
    const projectRoot = path.join(root, "project")
    const reservedPort = await listenOnFreePort()
    await closeServer(reservedPort.server)
    const port = reservedPort.port

    await fs.mkdir(packDirectory, { recursive: true })
    await fs.mkdir(projectRoot, { recursive: true })
    await fs.writeFile(
      path.join(projectRoot, "package.json"),
      `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`
    )

    const reactTarballPath = await packPackage({
      cwd: reactPackageRoot,
      packDirectory,
    })
    const cliTarballPath = await packPackage({
      cwd: packageRoot,
      packDirectory,
    })

    await execNpm(["install", reactTarballPath, cliTarballPath], {
      cwd: projectRoot,
    })
    await execFileAsync(
      process.execPath,
      [
        path.join(
          projectRoot,
          "node_modules",
          "agent-html",
          "bin",
          "agent-html.mjs"
        ),
        "init",
      ],
      { cwd: projectRoot, windowsHide: true }
    )

    const outputChunks = []
    const child = spawn(
      process.execPath,
      [
        path.join(
          projectRoot,
          "node_modules",
          "agent-html",
          "bin",
          "agent-html.mjs"
        ),
        "dev",
        "--port",
        String(port),
      ],
      {
        cwd: projectRoot,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      }
    )
    const childClosed = new Promise((resolve) => child.once("close", resolve))
    child.stdout.on("data", (chunk) => outputChunks.push(chunk.toString("utf8")))
    child.stderr.on("data", (chunk) => outputChunks.push(chunk.toString("utf8")))
    const output = () => outputChunks.join("")

    try {
      const url = `http://127.0.0.1:${port}`
      await waitForDevHost(url, child, output)

      const html = await fetch(url).then((response) => response.text())
      expect(html).toContain("/__agent-html/host-entry.js")

      const hostEntry = await fetch(`${url}/__agent-html/host-entry.js`).then(
        (response) => response.text()
      )
      expect(hostEntry).not.toContain("/node_modules/react-dom/client.js")

      const bundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      bundleUrl.searchParams.set(
        "filePath",
        "agent-html/artifacts/project-visual-explainer.artifact.tsx"
      )
      const bundle = await fetch(bundleUrl).then((response) => response.text())
      expect(bundle).toContain("function mount")
      expect(bundle).not.toContain("/node_modules/react-dom/client.js")

      const css = await fetch(`${url}/__agent-html/styles.css`).then((response) =>
        response.text()
      )
      expect(css).toContain(".canvas-surface-frame")
      expect(css).toContain(".bg-primary")
      expect(output()).not.toContain("[BABEL]")
    } finally {
      if (child.exitCode === null) {
        child.kill()
      }
      await childClosed
    }
  }, packageInstallSmokeTimeout)
})
