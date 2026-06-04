# React Canvas Sidebar Shell Blueprint

## Core Idea

React Canvas host shell should use the local shadcn sidebar primitive as the
structural app shell, while keeping all visual values inside the existing
Canvas design pipeline.

The target shell is:

```text
left sidebar
  -> artifact selector

center inset
  -> artifact preview surface

right sidebar
  -> AI conversation surface
```

Host shell owns workspace chrome. Artifacts own their own content layout.

## Sidebar Structure

Use the shadcn sidebar composition as the structural contract:

```text
SidebarProvider
├── Sidebar
│   ├── SidebarHeader
│   ├── SidebarContent
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel
│   │       └── SidebarGroupContent
│   │           └── SidebarMenu
│   │               └── SidebarMenuItem
│   │                   └── SidebarMenuButton
│   ├── SidebarFooter
│   └── SidebarRail
├── SidebarInset
└── SidebarTrigger
```

The host should compose these primitives directly from `.agent-html/ui/sidebar`.

Recommended ownership:

```text
SidebarProvider
  -> sidebar state boundary

Sidebar
  -> left or right shell panel

SidebarHeader
  -> workspace title, active mode, compact controls

SidebarContent
  -> scrollable navigation or conversation body

SidebarGroup
  -> artifact groups, prompt sections, run status sections

SidebarMenu
  -> selectable artifacts, actions, or conversation entries

SidebarInset
  -> center artifact preview surface

SidebarRail / SidebarTrigger
  -> collapse controls
```

## Token Consumption

The sidebar shell should consume the unified Canvas token pipeline directly.

Allowed token-backed utilities include:

```text
bg-background
text-foreground
bg-sidebar
text-sidebar-foreground
bg-sidebar-accent
text-sidebar-accent-foreground
border-sidebar-border
ring-sidebar-ring
bg-sidebar-primary
text-sidebar-primary-foreground
```

The shell should not define raw visual values for color, radius, or font.

Do not:

```text
import external shadcn source directly
write raw palette classes for sidebar chrome
introduce one-off radius or font values
fork sidebar primitives for cosmetic changes
move sidebar component structure into styles.css
```

The sidebar primitive owns component shape and state classes. `theme.css` and
`styles.css` own token values and Tailwind bridge behavior.

## Example References

### `sidebar-example/sidebar.md`

Use as the canonical sidebar contract.

Reference:

- primitive names
- provider responsibilities
- slot structure
- `side`, `variant`, and `collapsible` props
- `SidebarInset`, `SidebarRail`, and `SidebarTrigger` usage

Do not copy the docs text into app docs. Link to it or summarize only the
structural decisions needed for the host shell.

### `sidebar-example/A sidebar on the right`

Use for right sidebar structure.

Reference:

```tsx
<SidebarProvider>
  <SidebarInset>{/* main content */}</SidebarInset>
  <AppSidebar side="right" />
</SidebarProvider>
```

This proves the primitive supports `side="right"` and that a right sidebar can
sit beside `SidebarInset`.

Do not copy the example content. It is a table-of-contents sidebar, not an AI
conversation surface.

Important limitation: the example only contains one sidebar. It does not solve
independent left and right sidebar collapse state.

### `sidebar-example/A sidebar with a sticky site header`

Use for future host header structure.

Reference:

```tsx
<SidebarProvider className="flex flex-col">
  <SiteHeader />
  <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset>{/* main content */}</SidebarInset>
  </div>
</SidebarProvider>
```

This is useful if React Canvas later needs a sticky workspace header above the
artifact surface.

Do not introduce a top header during the sidebar shell refactor unless it is
needed by the host workflow.

## Three-Column Direction

The desired host topology is:

```text
ArtifactSidebar
  -> local Sidebar, side left, artifact selection

ArtifactSurface
  -> SidebarInset, center preview and block overlays

AiSidebar
  -> local Sidebar-style shell, side right, prompt and conversation surface
```

The left sidebar should support icon collapse for artifact navigation.

The right sidebar should support collapse for the AI conversation surface.

The implementation must explicitly handle state boundaries. Do not assume two
collapsible sidebars inside one `SidebarProvider` will be independent, because
the provider exposes one sidebar state context.

## Review Checks

Before implementing the host shell refactor, confirm:

- Host imports sidebar primitives from `.agent-html/ui/sidebar` only.
- Sidebar chrome uses token-backed semantic utilities.
- Artifact selection remains in the left sidebar.
- Artifact rendering remains in the center inset.
- AI prompt and conversation surface move out of modal or sheet chrome and into
  the right shell surface.
- Left and right collapse behavior is not accidentally coupled.
- No sidebar primitive is forked for cosmetic reasons.

## Non-Goals

- Do not redesign artifact content layout.
- Do not modify `@agent-html/react`; it remains headless.
- Do not rewrite shadcn sidebar primitives to add visual tokens.
- Do not add a sticky host header unless the host workflow requires it.
- Do not copy demo data or table-of-contents content from the examples.
