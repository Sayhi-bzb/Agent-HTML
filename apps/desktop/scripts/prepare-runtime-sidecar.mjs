import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const appRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const binariesRoot = path.join(appRoot, "src-tauri", "binaries")
const runtimeRoot = path.join(appRoot, "runtime")
const repoRoot = path.resolve(appRoot, "../..")

function hostTarget() {
  const arch = os.arch()
  const platform = os.platform()

  if (platform === "linux" && arch === "x64") return "x86_64-unknown-linux-gnu"
  if (platform === "linux" && arch === "arm64") return "aarch64-unknown-linux-gnu"
  if (platform === "darwin" && arch === "x64") return "x86_64-apple-darwin"
  if (platform === "darwin" && arch === "arm64") return "aarch64-apple-darwin"
  if (platform === "win32" && arch === "x64") return "x86_64-pc-windows-msvc"
  if (platform === "win32" && arch === "arm64") return "aarch64-pc-windows-msvc"

  throw new Error(`Unsupported runtime target: ${platform}/${arch}`)
}

const target = process.env.TAURI_ENV_TARGET_TRIPLE || hostTarget()
const extension = os.platform() === "win32" ? ".exe" : ""
const targetPath = path.join(
  binariesRoot,
  `agent-html-runtime-${target}${extension}`
)

await fs.mkdir(binariesRoot, { recursive: true })
await fs.copyFile(process.execPath, targetPath)
if (os.platform() !== "win32") await fs.chmod(targetPath, 0o755)

const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm"
const packRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ahtml-runtime-pack-"))
const pack = (packagePath) => {
  const output = execFileSync(
    npmExecutable,
    ["pack", packagePath, "--pack-destination", packRoot],
    { encoding: "utf8" }
  )
  return path.join(packRoot, output.trim().split("\n").at(-1))
}
const reactPackage = pack(path.join(repoRoot, "packages/react"))
const cliPackage = pack(path.join(repoRoot, "packages/cli"))

await fs.rm(path.join(runtimeRoot, "node_modules"), {
  force: true,
  recursive: true,
})
await fs.rm(path.join(runtimeRoot, "package-lock.json"), { force: true })
execFileSync(
  npmExecutable,
  [
    "install",
    "--prefix",
    runtimeRoot,
    "--install-links=true",
    "--omit=dev",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    reactPackage,
    cliPackage,
  ],
  { stdio: "inherit" }
)
await fs.rm(packRoot, { force: true, recursive: true })

console.log(`Prepared bundled Node runtime: ${targetPath}`)
