import { createServer } from "node:http"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { requiredShadcnRuntimeComponents } from "../../packages/ahtml/src/config/render-capabilities.mjs"

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "shadcn-test-fixtures",
)
const styleNames = ["nova", "vega", "maia", "lyra", "mira", "luma", "sera"]

export async function startShadcnTestServer() {
  const fixtures = await loadFixtures()
  const server = createServer((request, response) => {
    try {
      if (!request.url) {
        respondJson(response, 400, { error: "missing-url" })
        return
      }

      const url = new URL(request.url, "http://127.0.0.1")
      if (process.env.AHTML_DEBUG_SHADCN_TEST_SERVER === "1") {
        console.log(`[shadcn-test-server] ${url.pathname}${url.search}`)
      }
      const presetMatch = url.pathname === "/init"
      const rootIndexMatch = url.pathname === "/r/index.json"
      const baseColorMatch = url.pathname === "/r/colors/neutral.json"
      const styleIndexMatch = url.pathname === "/r/styles/index.json"
      const styleRegistryMatch = url.pathname.match(
        /^\/r\/styles\/([^/]+)\/registry\.json$/,
      )
      const styleComponentIndexMatch = url.pathname.match(
        /^\/r\/styles\/([^/]+)\/index\.json$/,
      )
      const componentMatch = url.pathname.match(
        /^\/r\/styles\/([^/]+)\/([^/]+)\.json$/,
      )

      if (presetMatch) {
        const style = url.searchParams.get("style") ?? "nova"
        respondJson(response, 200, createPresetItem({ fixtures, style }))
        return
      }

      if (rootIndexMatch) {
        respondJson(response, 200, createRegistryIndex(fixtures))
        return
      }

      if (styleIndexMatch) {
        respondJson(
          response,
          200,
          styleNames.map((name) => ({
            name,
            label: capitalize(name),
          })),
        )
        return
      }

      if (baseColorMatch) {
        respondJson(response, 200, createNeutralBaseColor())
        return
      }

      if (styleRegistryMatch) {
        respondJson(response, 200, createStyleRegistry(fixtures))
        return
      }

      if (styleComponentIndexMatch) {
        respondJson(response, 200, createStyleComponentIndex(fixtures))
        return
      }

      if (componentMatch) {
        const componentName = componentMatch[2]
        const componentSource = fixtures.components[componentName]

        if (!componentSource) {
          respondJson(response, 404, { error: "missing-component" })
          return
        }

        respondJson(
          response,
          200,
          createComponentItem({ componentName, componentSource }),
        )
        return
      }

      respondJson(response, 404, { error: "not-found" })
    } catch (error) {
      console.error("shadcn-test-server request failed", request.url, error)
      respondJson(response, 500, { error: "internal-server-error" })
    }
  })

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve)
  })

  const address = server.address()
  const port = typeof address === "object" && address ? address.port : 0

  return {
    registryUrl: `http://127.0.0.1:${port}/r`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      }),
  }
}

async function loadFixtures() {
  const componentsDir = path.join(fixtureRoot, "components", "ui")
  const templateViteAppDir = path.join(fixtureRoot, "template", "vite-app")
  const availableComponentNames = (await readdir(componentsDir))
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => name.replace(/\.tsx$/, ""))
    .sort()
  const componentPaths = new Map(
    availableComponentNames.map((name) => [
      name,
      path.join(componentsDir, `${name}.tsx`),
    ]),
  )
  const componentNames = await collectFixtureComponentClosure(componentPaths)
  const [baseCss, utilsSource, componentEntries] = await Promise.all([
    readFile(path.join(templateViteAppDir, "src", "index.css"), "utf8"),
    readFile(path.join(templateViteAppDir, "src", "lib", "utils.ts"), "utf8"),
    Promise.all(
      componentNames.map(async (name) => [
        name,
        await readFile(path.join(componentsDir, `${name}.tsx`), "utf8"),
      ]),
    ),
  ])

  return {
    baseCss,
    utilsSource,
    components: Object.fromEntries(componentEntries),
  }
}

async function collectFixtureComponentClosure(componentPaths) {
  const resolvedNames = new Set()
  const pendingNames = [...requiredShadcnRuntimeComponents]

  while (pendingNames.length > 0) {
    const componentName = pendingNames.pop()

    if (!componentName || resolvedNames.has(componentName)) {
      continue
    }

    const componentPath = componentPaths.get(componentName)

    if (!componentPath) {
      throw new Error(
        `Missing shadcn test fixture for runtime component "${componentName}".`,
      )
    }

    resolvedNames.add(componentName)
    const componentSource = await readFile(componentPath, "utf8")

    for (const dependencyName of collectUiRegistryDependencies(componentSource)) {
      if (!resolvedNames.has(dependencyName)) {
        pendingNames.push(dependencyName)
      }
    }
  }

  return [...resolvedNames].sort()
}

function createPresetItem({ fixtures, style }) {
  return {
    name: `ahtml-${style}`,
    type: "registry:base",
    title: "AHTML test preset",
    extends: "none",
    config: {
      style,
      rsc: false,
      tsx: true,
      tailwind: {
        css: "src/index.css",
        baseColor: "neutral",
        cssVariables: true,
        prefix: "",
      },
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks",
        utils: "@/lib/utils",
      },
    },
    files: [
      {
        path: "src/index.css",
        target: "src/index.css",
        type: "registry:file",
        content: fixtures.baseCss,
      },
      {
        path: "src/lib/utils.ts",
        target: "src/lib/utils.ts",
        type: "registry:file",
        content: fixtures.utilsSource,
      },
    ],
  }
}

function createRegistryIndex(fixtures) {
  return styleNames.map((style) => createPresetItem({ fixtures, style }))
}

function createComponentItem({ componentName, componentSource }) {
  const registryDependencies = collectUiRegistryDependencies(componentSource)

  return {
    name: componentName,
    type: "registry:ui",
    title: componentName,
    ...(registryDependencies.length > 0 ? { registryDependencies } : {}),
    files: [
      {
        path: `ui/${componentName}.tsx`,
        target: `src/components/ui/${componentName}.tsx`,
        type: "registry:ui",
        content: componentSource,
      },
    ],
  }
}

function createStyleComponentIndex(fixtures) {
  return Object.keys(fixtures.components)
    .sort()
    .map((name) => ({
      name,
      type: "registry:ui",
      title: name,
    }))
}

function createStyleRegistry(fixtures) {
  return {
    name: "ahtml-shadcn-test-registry",
    homepage: "https://example.com/ahtml-shadcn-test-registry",
    items: Object.entries(fixtures.components)
      .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
      .map(([componentName, componentSource]) =>
        createComponentItem({ componentName, componentSource }),
      ),
  }
}

function collectUiRegistryDependencies(componentSource) {
  return [
    ...new Set(
      [
        ...componentSource.matchAll(
          /from\s+["']@\/components\/ui\/([^"']+)["']/g,
        ),
      ]
        .map((match) => match[1])
        .filter(Boolean),
    ),
  ].sort()
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function createNeutralBaseColor() {
  const light = {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    primary: "oklch(0.205 0 0)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)",
    "secondary-foreground": "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.556 0 0)",
    accent: "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",
  }
  const dark = {
    background: "oklch(0.145 0 0)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.205 0 0)",
    "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.205 0 0)",
    "popover-foreground": "oklch(0.985 0 0)",
    primary: "oklch(0.922 0 0)",
    "primary-foreground": "oklch(0.205 0 0)",
    secondary: "oklch(0.269 0 0)",
    "secondary-foreground": "oklch(0.985 0 0)",
    muted: "oklch(0.269 0 0)",
    "muted-foreground": "oklch(0.708 0 0)",
    accent: "oklch(0.269 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.556 0 0)",
  }

  return {
    cssVars: {
      light,
      dark,
    },
    cssVarsV4: {
      light,
      dark,
    },
    inlineColors: {
      light,
      dark,
    },
    inlineColorsTemplate: "",
    cssVarsTemplate: "",
  }
}

function respondJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" })
  response.end(`${JSON.stringify(body, null, 2)}\n`)
}
