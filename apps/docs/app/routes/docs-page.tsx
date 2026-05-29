import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"
import { useParams } from "react-router"
import { source } from "@/lib/source"

export default function Page() {
  const params = useParams()
  const slug = params["*"]?.split("/").filter(Boolean) ?? []
  const page = source.getPage(slug)

  if (!page) {
    throw new Response("Not Found", { status: 404 })
  }

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? (
        <DocsDescription>{page.data.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  )
}
