import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import {
  fingerprintFiles,
  hashFile,
  isRuntimeInput,
  readPrepareState,
  runtimeFingerprintMetadata,
} from "./runtime-prepare-cache.mjs"
import {
  createRuntimeFingerprint,
  createRuntimeManifest,
  isRuntimeBundleReady,
  publishCurrentRuntime,
  renameWithRetries,
  runtimeBundleRoot,
  runtimeStorePaths,
  withRuntimeBuildLock,
  writeJsonAtomic,
} from "./runtime-store.mjs"
import { runOwnedProcess, terminateProcessTree } from "./runtime-process.mjs"
import {
  createRuntimeDependencyContract,
} from "../../../packages/cli/src/dev-server/runtime-dependency-contract.mjs"

const appRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = path.resolve(appRoot, "../..")
const runtimePackagePath = path.join(appRoot, "runtime", "package.json")

export function hostTarget({ arch = os.arch(), platform = os.platform() } = {}) {
  if (platform === "linux" && arch === "x64") return "x86_64-unknown-linux-gnu"
  if (platform === "linux" && arch === "arm64") return "aarch64-unknown-linux-gnu"
  if (platform === "darwin" && arch === "x64") return "x86_64-apple-darwin"
  if (platform === "darwin" && arch === "arm64") return "aarch64-apple-darwin"
  if (platform === "win32" && arch === "x64") return "x86_64-pc-windows-msvc"
  if (platform === "win32" && arch === "arm64") return "aarch64-pc-windows-msvc"
  throw new Error(`Unsupported runtime target: ${platform}/${arch}`)
}

function execNpm(args, options = {}, lease) {
  if (process.env.npm_execpath) {
    return runOwnedProcess(process.execPath, [process.env.npm_execpath, ...args], {
      capture: options.capture,
      environment: options.env,
      lease,
    })
  }
  if (process.platform === "win32") {
    throw new Error("npm executable path is unavailable; run an npm runtime script")
  }
  return runOwnedProcess("npm", args, {
    capture: options.capture,
    environment: options.env,
    lease,
  })
}

function listRuntimeInputs() {
  return execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "agent-html",
      "apps/desktop/runtime/package.json",
      "apps/desktop/scripts/runtime-builder.mjs",
      "apps/desktop/scripts/runtime-prepare-cache.mjs",
      "apps/desktop/scripts/runtime-store.mjs",
      "packages/react",
      "packages/cli",
      "package.json",
      "package-lock.json",
    ],
    { cwd: repoRoot }
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter(isRuntimeInput)
}

async function stagePackageSource(packagePath, packRoot) {
  const stagedPackagePath = path.join(
    packRoot,
    "sources",
    path.basename(packagePath)
  )
  await fs.cp(packagePath, stagedPackagePath, {
    recursive: true,
    filter(sourcePath) {
      const [firstSegment] = path.relative(packagePath, sourcePath).split(path.sep)
      return !["node_modules", "template"].includes(firstSegment)
    },
  })
  return stagedPackagePath
}

async function installRuntimeModules(stagingRoot, lease) {
  const packRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ahtml-runtime-pack-"))
  await lease?.registerTemporaryPath(packRoot)
  try {
    await fs.copyFile(runtimePackagePath, path.join(stagingRoot, "package.json"))
    const pack = async (packagePath, environment = process.env) => {
      const output = await execNpm(
        [
          "pack",
          packagePath,
          "--pack-destination",
          packRoot,
          "--loglevel=error",
        ],
        { capture: true, env: environment },
        lease
      )
      return path.join(packRoot, output.stdout.trim().split("\n").at(-1))
    }

    const reactSource = await stagePackageSource(
      path.join(repoRoot, "packages", "react"),
      packRoot
    )
    const cliSource = await stagePackageSource(
      path.join(repoRoot, "packages", "cli"),
      packRoot
    )
    const reactPackage = await pack(reactSource)
    const cliPackage = await pack(cliSource, {
      ...process.env,
      AHTML_TEMPLATE_SOURCE_ROOT: repoRoot,
    })

    await execNpm(
      [
        "install",
        "--prefix",
        stagingRoot,
        "--install-links=true",
        "--omit=dev",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--loglevel=error",
        reactPackage,
        cliPackage,
      ],
      {},
      lease
    )
  } finally {
    await fs.rm(packRoot, { force: true, recursive: true })
    await lease?.unregisterTemporaryPath(packRoot)
  }
}

async function buildIntoStaging({
  bundleFingerprint,
  dependencyClosureHash,
  fingerprint,
  nodeFileName,
  lease,
  stagingRoot,
  target,
}) {
  await fs.mkdir(path.join(stagingRoot, "bin"), { recursive: true })
  const nodeEntry = path.join(stagingRoot, "bin", nodeFileName)
  await fs.copyFile(process.execPath, nodeEntry)
  if (process.platform !== "win32") await fs.chmod(nodeEntry, 0o755)

  await installRuntimeModules(stagingRoot, lease)
  const cliPackage = JSON.parse(
    await fs.readFile(
      path.join(stagingRoot, "node_modules", "agent-html", "package.json"),
      "utf8"
    )
  )
  const reactPackage = JSON.parse(
    await fs.readFile(
      path.join(
        stagingRoot,
        "node_modules",
        "@agent-html",
        "react",
        "package.json"
      ),
      "utf8"
    )
  )
  const dependencyContract = createRuntimeDependencyContract(
    path.join(repoRoot, "agent-html")
  )
  const manifest = createRuntimeManifest({
    browserEntries: dependencyContract.browserEntries,
    builtAt: new Date().toISOString(),
    canvasDependencies: dependencyContract.canvasDependencies,
    cliVersion: cliPackage.version,
    dependencyContractDigest: dependencyContract.digest,
    dependencyContractVersion: dependencyContract.version,
    dependencyClosureHash,
    fingerprint,
    nodeFileName,
    nodeVersion: process.version,
    platform: process.platform,
    reactVersion: reactPackage.version,
    styleEntries: dependencyContract.styleEntries,
    target,
  })
  await fs.writeFile(
    path.join(stagingRoot, "runtime-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  )

  execFileSync(
    nodeEntry,
    [path.join(stagingRoot, manifest.cliEntry), "--help"],
    { stdio: "ignore", windowsHide: true }
  )
  await fs.writeFile(
    path.join(stagingRoot, "build-input.json"),
    `${JSON.stringify({ bundleFingerprint, fingerprint, target }, null, 2)}\n`
  )
}

async function publishImmutableBundle({
  bundleFingerprint,
  dependencyClosureHash,
  fingerprint,
  nodeFileName,
  paths,
  target,
  lease,
}) {
  const runtimeRoot = runtimeBundleRoot(paths, fingerprint)
  if (await isRuntimeBundleReady({ fingerprint, nodeFileName, root: runtimeRoot })) {
    return { built: false, runtimeRoot }
  }

  await fs.mkdir(paths.stagingRoot, { recursive: true })
  const stagingRoot = await fs.mkdtemp(
    path.join(paths.stagingRoot, `${fingerprint}-${process.pid}-`)
  )
  await lease?.registerTemporaryPath(stagingRoot)
  try {
    await buildIntoStaging({
      bundleFingerprint,
      dependencyClosureHash,
      fingerprint,
      nodeFileName,
      lease,
      stagingRoot,
      target,
    })
    if (
      !(await isRuntimeBundleReady({
        fingerprint,
        nodeFileName,
        root: stagingRoot,
      }))
    ) {
      throw new Error("Runtime staging verification failed")
    }

    await fs.mkdir(paths.runtimesRoot, { recursive: true })
    try {
      await renameWithRetries(stagingRoot, runtimeRoot)
    } catch (error) {
      if (
        !["EEXIST", "ENOTEMPTY"].includes(error?.code) ||
        !(await isRuntimeBundleReady({
          fingerprint,
          nodeFileName,
          root: runtimeRoot,
        }))
      ) {
        throw error
      }
    }
    return { built: true, runtimeRoot }
  } finally {
    await fs.rm(stagingRoot, { force: true, recursive: true })
    await lease?.unregisterTemporaryPath(stagingRoot)
  }
}

async function preparePublishedRuntime(runtimeRoot, paths) {
  const manifestPath = path.join(runtimeRoot, "runtime-manifest.json")
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"))
  const nodeEntry = path.join(runtimeRoot, ...manifest.nodeEntry.split("/"))
  const cliEntry = path.join(runtimeRoot, ...manifest.cliEntry.split("/"))
  const workspaceTemplate = path.join(
    runtimeRoot,
    ...manifest.workspaceTemplate.split("/")
  )
  await runOwnedProcess(
    nodeEntry,
    [
      cliEntry,
      "runtime-prepare",
      "--root",
      path.dirname(workspaceTemplate),
    ],
    {
      environment: {
        ...process.env,
        AGENT_HTML_RUNTIME_CACHE_HOME: path.join(paths.root, "cache"),
        AGENT_HTML_RUNTIME_FINGERPRINT: manifest.fingerprint,
        AGENT_HTML_RUNTIME_MANIFEST: manifestPath,
      },
    }
  )
}

async function recoverStaleBuild(owner, paths) {
  for (const pid of owner?.childPids || []) terminateProcessTree(pid)
  for (const temporaryPath of owner?.temporaryPaths || []) {
    const absolutePath = path.resolve(temporaryPath)
    const relativeToStaging = path.relative(paths.stagingRoot, absolutePath)
    const isRuntimeStaging =
      relativeToStaging &&
      !relativeToStaging.startsWith("..") &&
      !path.isAbsolute(relativeToStaging)
    const isPackStaging =
      path.dirname(absolutePath) === os.tmpdir() &&
      path.basename(absolutePath).startsWith("ahtml-runtime-pack-")
    if (isRuntimeStaging || isPackStaging) {
      await fs.rm(absolutePath, { force: true, recursive: true })
    }
  }
}

export async function ensureRuntime({ publish = true } = {}) {
  const paths = runtimeStorePaths()
  const target = process.env.TAURI_ENV_TARGET_TRIPLE || hostTarget()
  const nodeFileName = process.platform === "win32" ? "node.exe" : "node"
  const previousState = await readPrepareState(paths.inputStatePath)
  const bundle = await fingerprintFiles(
    repoRoot,
    listRuntimeInputs(),
    runtimeFingerprintMetadata({
      arch: process.arch,
      nodeVersion: process.version,
      npmUserAgent: process.env.npm_config_user_agent,
      platform: process.platform,
    }),
    previousState?.bundleFiles
  )
  const nodeFingerprint = await hashFile(process.execPath, {
    node: process.version,
  })
  const dependencyClosureHash = await hashFile(
    path.join(repoRoot, "package-lock.json")
  )
  const fingerprint = createRuntimeFingerprint({
    bundleFingerprint: bundle.fingerprint,
    nodeFingerprint,
    target,
  })
  const lockPath = path.join(paths.locksRoot, fingerprint)
  const result = await withRuntimeBuildLock(lockPath, (lease) =>
    publishImmutableBundle({
      bundleFingerprint: bundle.fingerprint,
      dependencyClosureHash,
      fingerprint,
      nodeFileName,
      lease,
      paths,
      target,
    }),
    {
      onStaleOwner: (owner) => recoverStaleBuild(owner, paths),
    }
  )

  await preparePublishedRuntime(result.runtimeRoot, paths)

  await writeJsonAtomic(paths.inputStatePath, {
    version: 2,
    bundleFiles: bundle.files,
    bundleFingerprint: bundle.fingerprint,
    dependencyClosureHash,
    fingerprint,
    nodeFingerprint,
    target,
  })
  if (publish) {
    await publishCurrentRuntime(paths, {
      fingerprint,
      selectedAt: new Date().toISOString(),
      target,
    })
  }

  console.log(
    result.built
      ? `Built immutable Desktop runtime: ${result.runtimeRoot}`
      : `Immutable Desktop runtime is up to date: ${result.runtimeRoot}`
  )
  return { ...result, fingerprint, nodeFileName, paths, target }
}
