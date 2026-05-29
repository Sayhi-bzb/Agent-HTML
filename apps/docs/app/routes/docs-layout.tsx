import { DocsLayout } from "fumadocs-ui/layouts/notebook"
import { Outlet } from "react-router"
import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"

export default function Layout() {
  const { nav, ...base } = baseOptions()

  return (
    <DocsLayout
      {...base}
      nav={{ ...nav, mode: "top" }}
      tabMode="navbar"
      tree={source.getPageTree()}
    >
      <Outlet />
    </DocsLayout>
  )
}
