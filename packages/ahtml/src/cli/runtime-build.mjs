import { execFile, spawn } from "node:child_process"
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { parse, parseFragment, serialize } from "parse5"

import { getRuntimePaths, runtimePackageRoot } from "./runtime-paths.mjs"
import { getRuntimeStatus } from "./runtime-status.mjs"
import { resolveRuntimeDependencies } from "./runtime-template.mjs"

const viteBuildTimeoutMs = 90000
const ssrRenderTimeoutMs = 30000

export async function buildRuntimeArtifact({
  outputDir,
  packageRoot = runtimePackageRoot,
  paths = getRuntimePaths(),
}) {
  const status = await getRuntimeStatus({
    outputDir,
    paths,
  })

  if (!status.ready) {
    throw new Error(
      [
        `Managed runtime is not ready at ${paths.runtimeRoot}.`,
        status.manifestError ? `Manifest: ${status.manifestError}` : "",
        status.runtimeDetail ? `Detail: ${status.runtimeDetail}` : "",
        "Run ahtml setup or ahtml doctor to repair the managed runtime before build.",
      ]
        .filter(Boolean)
        .join(" "),
    )
  }

  await rm(outputDir, { force: true, recursive: true })
  await mkdir(outputDir, { recursive: true })

  const { viteBin } = resolveRuntimeDependencies(packageRoot)
  await execFileWithTimeout(
    process.execPath,
    [
      viteBin,
      "build",
      "--config",
      paths.runtimeViteConfigPath,
      "--outDir",
      outputDir,
    ],
    {
      cwd: paths.runtimeDir,
      env: {
        ...process.env,
        AHTML_RUNTIME_PACKAGE_ROOT: packageRoot,
      },
      timeout: resolveChildProcessTimeout(viteBuildTimeoutMs),
    },
  )
  await rm(paths.runtimeSsrDir, { force: true, recursive: true })
  await execFileWithTimeout(
    process.execPath,
    [
      viteBin,
      "build",
      "--config",
      paths.runtimeViteConfigPath,
      "--ssr",
      path.join(paths.runtimeSrcDir, "ssr.tsx"),
      "--outDir",
      paths.runtimeSsrDir,
    ],
    {
      cwd: paths.runtimeDir,
      env: {
        ...process.env,
        AHTML_RUNTIME_PACKAGE_ROOT: packageRoot,
      },
      timeout: resolveChildProcessTimeout(viteBuildTimeoutMs),
    },
  )

  const ssr = await execFileWithTimeout(
    process.execPath,
    [await findSsrEntrypoint(paths.runtimeSsrDir)],
    {
      cwd: paths.runtimeDir,
      env: {
        ...process.env,
        AHTML_RUNTIME_PACKAGE_ROOT: packageRoot,
      },
      timeout: resolveChildProcessTimeout(ssrRenderTimeoutMs),
    },
  )
  await patchBuiltIndexHtml({
    html: ssr.stdout.trim(),
    outputDir,
  })
  await copyDefaultBrandIcon({ outputDir, packageRoot })
}

async function execFileWithTimeout(file, args, options) {
  try {
    return await execFileWithProcessTreeCleanup(file, args, options)
  } catch (error) {
    const command = [file, ...args].join(" ")
    const detail =
      error instanceof Error && typeof error.message === "string"
        ? error.message
        : String(error)
    const stdout =
      typeof error?.stdout === "string" && error.stdout.trim().length > 0
        ? ` stdout: ${error.stdout.trim()}`
        : ""
    const stderr =
      typeof error?.stderr === "string" && error.stderr.trim().length > 0
        ? ` stderr: ${error.stderr.trim()}`
        : ""

    throw new Error(
      `Runtime build command failed or timed out: ${command}. ${detail}${stdout}${stderr}`,
    )
  }
}

function resolveChildProcessTimeout(defaultTimeoutMs) {
  const override = Number(process.env.AHTML_CHILD_PROCESS_TIMEOUT_MS)

  if (Number.isInteger(override) && override > 0) {
    return override
  }

  return defaultTimeoutMs
}

function execFileWithProcessTreeCleanup(file, args, options) {
  return new Promise((resolve, reject) => {
    let stdout = ""
    let stderr = ""
    let settled = false
    const child = spawn(
      file,
      args,
      {
        cwd: options.cwd,
        env: options.env,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    )
    const timeout = setTimeout(() => {
      if (settled) {
        return
      }

      settled = true
      void terminateProcessTree(child).finally(() => {
        reject(
          Object.assign(
            new Error(`Command timed out after ${options.timeout}ms.`),
            {
              stdout,
              stderr,
            },
          ),
        )
      })
    }, options.timeout)

    child.stdout.setEncoding("utf8")
    child.stderr.setEncoding("utf8")
    child.stdout.on("data", (chunk) => {
      stdout += chunk
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk
    })
    child.on("error", (error) => {
      if (settled) {
        return
      }

      clearTimeout(timeout)
      settled = true
      reject(
        Object.assign(error, {
          stdout,
          stderr,
        }),
      )
    })
    child.on("exit", (code, signal) => {
        if (settled) {
          return
        }

        clearTimeout(timeout)
        settled = true

        if (code !== 0) {
          reject(
            Object.assign(
              new Error(
                `Command exited with code ${String(code)} signal ${String(signal)}.`,
              ),
              {
                code,
                signal,
              stdout,
              stderr,
              },
            ),
          )
          return
        }

        resolve({ stdout, stderr })
      },
    )
  })
}

async function terminateProcessTree(child) {
  if (child.exitCode !== null) {
    return
  }

  if (process.platform !== "win32" || child.pid === undefined) {
    child.kill("SIGTERM")
    return
  }

  await new Promise((resolve) => {
    execFile(
      "taskkill",
      ["/pid", String(child.pid), "/t", "/f"],
      { windowsHide: true },
      () => resolve(),
    )
  })
}

export async function patchBuiltIndexHtml({ html, outputDir }) {
  const indexPath = path.join(outputDir, "index.html")
  const source = await readFile(indexPath, "utf8")
  const document = parse(source)
  const htmlDocument = findFirstElementByTag(document, "html")
  const head = findFirstElementByTag(htmlDocument ?? document, "head")
  const body = findFirstElementByTag(htmlDocument ?? document, "body")
  const root = findElementById(body ?? document, "root")

  if (!head || !body || !root) {
    throw new Error(
      `Built index.html is missing expected head/body/root nodes.`,
    )
  }

  replaceHeadTitle(head, getSsrDocumentTitle(html))
  replaceHeadIcon(head)
  replaceRootContent(root, html)

  await writeFile(indexPath, await serialize(document))
}

async function copyDefaultBrandIcon({ outputDir, packageRoot }) {
  await copyFile(
    path.join(packageRoot, "assets", "ghost.svg"),
    path.join(outputDir, "ghost.svg"),
  )
}

async function findSsrEntrypoint(directory) {
  const entries = await readdir(directory, { recursive: true })
  const entry = entries
    .map((item) => String(item))
    .find(
      (item) =>
        item.endsWith("ssr.mjs") ||
        item.endsWith("ssr.js") ||
        item.endsWith(".mjs") ||
        item.endsWith(".js"),
    )

  if (!entry) {
    throw new Error(`SSR renderer entry was not built in ${directory}.`)
  }

  return path.join(directory, entry)
}

function getSsrDocumentTitle(html) {
  const fragment = parseFragment(html)
  const heading = findFirstElementByTag(fragment, "h1")
  const title = heading ? getTextContent(heading).trim() : ""

  return title || "agent-html artifact"
}

function replaceHeadTitle(head, title) {
  const titleElement = createElementNode("title", title)
  const existingTitleIndex = head.childNodes.findIndex(
    (node) => isElementNode(node) && node.tagName === "title",
  )

  if (existingTitleIndex >= 0) {
    head.childNodes.splice(existingTitleIndex, 1, titleElement)
    titleElement.parentNode = head
    return
  }

  head.childNodes.push(titleElement)
  titleElement.parentNode = head
}

function replaceHeadIcon(head) {
  const iconElement = createElementNode(
    "link",
    undefined,
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "./ghost.svg",
    },
    true,
  )
  const existingIconIndex = head.childNodes.findIndex(
    (node) =>
      isElementNode(node) &&
      node.tagName === "link" &&
      node.attrs.some((attr) => attr.name === "rel" && attr.value === "icon"),
  )

  if (existingIconIndex >= 0) {
    head.childNodes.splice(existingIconIndex, 1, iconElement)
    iconElement.parentNode = head
    return
  }

  head.childNodes.push(iconElement)
  iconElement.parentNode = head
}

function replaceRootContent(root, html) {
  const replacementRoot = parseFragment(
    `<div id="root">${html}</div>`,
  ).childNodes.find(
    (node) =>
      isElementNode(node) &&
      node.tagName === "div" &&
      getAttrValue(node, "id") === "root",
  )

  if (!replacementRoot || !isElementNode(replacementRoot)) {
    throw new Error("Unable to create SSR root content for built artifact.")
  }

  root.childNodes = replacementRoot.childNodes
  for (const child of root.childNodes) {
    child.parentNode = root
  }
}

function createElementNode(
  tagName,
  textContent,
  attrs = {},
  selfClosing = false,
) {
  const [element] = parseFragment(
    selfClosing
      ? `<${tagName}${formatAttrs(attrs)}>`
      : `<${tagName}${formatAttrs(attrs)}>${escapeHtml(textContent ?? "")}</${tagName}>`,
  ).childNodes

  if (!element || !isElementNode(element)) {
    throw new Error(`Unable to create ${tagName} element for built artifact.`)
  }

  return element
}

function formatAttrs(attrs) {
  const entries = Object.entries(attrs)

  if (entries.length === 0) {
    return ""
  }

  return ` ${entries
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(" ")}`
}

function findElementById(node, id) {
  return walkElements(node).find(
    (element) => getAttrValue(element, "id") === id,
  )
}

function findFirstElementByTag(node, tagName) {
  return walkElements(node).find((element) => element.tagName === tagName)
}

function walkElements(node) {
  if (!node || typeof node !== "object") {
    return []
  }

  const childNodes = Array.isArray(node.childNodes) ? node.childNodes : []
  const elements = []

  for (const child of childNodes) {
    if (isElementNode(child)) {
      elements.push(child)
    }

    elements.push(...walkElements(child))
  }

  return elements
}

function isElementNode(node) {
  return Boolean(node && typeof node === "object" && "tagName" in node)
}

function getAttrValue(node, name) {
  return node.attrs.find((attr) => attr.name === name)?.value
}

function getTextContent(node) {
  const childNodes = Array.isArray(node.childNodes) ? node.childNodes : []

  return childNodes
    .map((child) => {
      if (child.nodeName === "#text") {
        return child.value
      }

      return getTextContent(child)
    })
    .join("")
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
