import { createElement } from "react"
import { loader, source as createSource, getSlugs } from "fumadocs-core/source"
import browserCollections from "@source/browser"

const docFiles = import.meta.glob("/content/docs/**/*.{mdx,md}", {
  base: "/content/docs",
  eager: true,
  import: "frontmatter",
  query: {
    collection: "docs",
  },
})

const metaFiles = import.meta.glob("/content/docs/**/*.{json,yaml}", {
  base: "/content/docs",
  eager: true,
  import: "default",
  query: {
    collection: "meta",
  },
})

const clientDocs = browserCollections.docs.createClientLoader({
  component: (loaded) => {
    const MDX = loaded.default
    return createElement(MDX)
  },
})

function toSourcePath(path: string) {
  return path.replace(/^\.?\//, "").replace(/^content\/docs\//, "")
}

const docs = Object.entries(docFiles).map(([path, file]) => {
  const sourcePath = toSourcePath(path)
  const frontmatter = file as {
    title?: string
    description?: string
  }

  return {
    type: "page" as const,
    path: sourcePath,
    slugs: getSlugs(sourcePath),
    data: {
      title: frontmatter.title,
      description: frontmatter.description,
      toc: [],
      body: clientDocs.getComponent(sourcePath),
    },
  }
})

const metas = Object.entries(metaFiles).map(([path, data]) => ({
  type: "meta" as const,
  path: toSourcePath(path),
  data: data as {
    title?: string
    root?: boolean
    pages?: string[]
  },
}))

export const source = loader({
  baseUrl: "/docs",
  source: createSource({
    pages: docs,
    metas,
  }),
})
