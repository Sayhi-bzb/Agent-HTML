import { cp, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoOutDir = path.join(repoRoot, "dist-agent-html");
const docsClientDir = path.join(repoRoot, "apps", "docs", "build", "client");

async function ensureDirectory(directory) {
  const info = await stat(directory).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(`Expected directory to exist: ${directory}`);
  }
}

async function replaceDirectory(source, target) {
  await rm(target, { force: true, recursive: true });
  await cp(source, target, { recursive: true });
}

async function copyRootDocsFiles() {
  const entries = await readdir(docsClientDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    if (entry.name === "index.html") continue;

    await cp(path.join(docsClientDir, entry.name), path.join(demoOutDir, entry.name));
  }
}

async function mergeDocsBuild() {
  await ensureDirectory(demoOutDir);
  await ensureDirectory(docsClientDir);

  await cp(path.join(docsClientDir, "assets"), path.join(demoOutDir, "assets"), {
    recursive: true,
  });
  await replaceDirectory(path.join(docsClientDir, "docs"), path.join(demoOutDir, "docs"));
  await replaceDirectory(path.join(docsClientDir, "og"), path.join(demoOutDir, "og"));
  await copyRootDocsFiles();
}

await mergeDocsBuild();

console.log(`Built AgentHTML site at ${demoOutDir}`);
