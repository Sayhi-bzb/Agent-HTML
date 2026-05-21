import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

const stats = [
  { label: "Active agents", value: "12", detail: "+2 this week" },
  { label: "Artifacts built", value: "48", detail: "7 pending review" },
  { label: "Failed checks", value: "03", detail: "Needs triage" },
]

const activity = [
  {
    title: "Sidebar template attached",
    summary: "Main shell now uses the shadcn sidebar provider and header.",
    time: "Just now",
  },
  {
    title: "Workspace status",
    summary: "Template components are wired and ready for page-specific content.",
    time: "Ready",
  },
  {
    title: "Next step",
    summary: "Replace placeholder cards with real module data or routes.",
    time: "Open",
  },
]

export function App() {
  return (
    <SidebarProvider
      className="min-h-svh flex-col"
      style={
        {
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <SiteHeader />
      <main className="flex min-h-0 flex-1">
        <AppSidebar variant="inset" />
        <SidebarInset className="min-h-0 rounded-none border-0 shadow-none md:m-0 md:rounded-none">
          <div className="flex flex-1 flex-col">
            <header className="border-b px-4 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    Workspace shell
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Agent Console
                  </h1>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    The page header stays above the main content row, while the
                    sidebar now belongs to the main layout area.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline">Preview Layout</Button>
                  <Button>Open Workspace</Button>
                </div>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
              <section className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
                  >
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.detail}
                    </p>
                  </article>
                ))}
              </section>

              <section className="grid flex-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <article className="rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    <div className="rounded-lg border border-dashed p-4">
                      <p className="text-sm font-medium">Primary content area</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Put your routed page, dashboard widgets, or editor here.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed p-4">
                      <p className="text-sm font-medium">Responsive behavior</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        On mobile, the sidebar switches to a sheet automatically.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="border-b px-5 py-4">
                    <p className="text-sm font-medium">Recent activity</p>
                  </div>
                  <div className="flex flex-col gap-3 p-5">
                    {activity.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-lg border border-dashed p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">{item.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </div>
          </div>
        </SidebarInset>
      </main>
    </SidebarProvider>
  )
}

export default App
