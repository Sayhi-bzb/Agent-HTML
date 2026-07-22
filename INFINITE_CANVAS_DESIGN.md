# Infinite Canvas Design

Status: Canvas vertical slice implemented beside `Artifact / Block`. The Canvas constitution remains [`apps/docs/content/docs/index.mdx`](apps/docs/content/docs/index.mdx).

## Model

```text
Folder / Workspace
└── Canvas 1..n
    └── Node 0..n
        └── React content
```

A Folder is the durable project space. Each `*.canvas.tsx` is an independent spatial document. A Node connects React content to machine geometry; no Block or Edge layer exists in the Canvas model.

Authoring adds only `Canvas` and `Node` to React:

```tsx
import { Canvas, Node } from "@agent-html/react"
import { IntakeForm } from "./content/intake-form"

export default function OperationsCanvas() {
  return (
    <Canvas>
      <Node id="planning">
        <PlanningBackground />

        <Node id="intake">
          <IntakeForm />
        </Node>
      </Node>
    </Canvas>
  )
}
```

The public shape is `Canvas { children }` and `Node { id, children }`. JSX nesting derives `parentId`; source order derives `siblingOrder`; `id` derives the Host label. A Node containing child Nodes is a container. Geometry, titles, types, indexes, and source paths are not authored props.

## Two Hierarchies

Filesystem ownership:

```text
agent-html/
├── canvases/
│   ├── operations.canvas.tsx
│   ├── content/
│   └── .layout/
│       └── operations.canvas.tsx.json
├── components/
└── components/ui/
```

React composition:

```text
Canvas
└── Node
    ├── React content / Component
    │   └── components/ui
    └── Node
```

The Canvas file is the global semantic view. Canvas-local content files hold larger React implementations; reusable implementations remain ordinary Components. A mandatory `*.node.tsx` file would duplicate boundaries and is not part of the model.

## Three Data Planes

| Plane | Owner | State |
| --- | --- | --- |
| Semantic source | Workspace author | `*.canvas.tsx`, React content, JSX hierarchy |
| Shared geometry | Canvas Host | `canvases/.layout/<relative-canvas-path>.json` |
| Local session/view | Host preferences and XState | viewport, tool, selection, focus, phase |

Shared layout v3 contains geometry only:

```json
{
  "version": 3,
  "nodes": {
    "intake": {
      "x": 29,
      "y": 68,
      "width": 360,
      "height": 500
    }
  }
}
```

Coordinates are exact, parent-local spatial facts. Storage does not round them or add semantic concepts such as grids, proximity, types, or a minimum unit. `.layout/**` is generated machine data, excluded from normal text diff and workspace indexing. The registry and Host API expose Canvas identity, never its physical layout path or storage format.

Viewport is keyed by Canvas file path in Host preferences. Tool, selection, focus owner, and transient phase remain in the Host-private XState actor. High-frequency pointer coordinates stay in React Flow memory; one dirty geometry patch is persisted when a move or resize gesture ends.

## Runtime Boundary

```text
JSX intent + shared geometry
              ↓
      Canonical Canvas Store
              ↓
       React Flow adapter
              ↓
         @xyflow/react
```

The Store separates structural and spatial records:

```ts
type NodeRecord = {
  id: string
  parentId?: string
  siblingOrder: number
}

type NodeGeometry = {
  x: number
  y: number
  width: number
  height: number
}
```

React context supplies the nearest parent Node at runtime. Each Node owns a portal target, so nested Nodes remain spatial siblings in the rendered viewport rather than becoming DOM layout children. Cold inspection performs the same hierarchy derivation with a static JSX DFS.

React Flow is a private geometry and viewport engine. `@use-gesture/react` normalizes Host pan input. XState owns discrete interaction state. No dependency type enters public Canvas records.

## Interaction

The bottom Dock selects Pointer (`V`) or Hand (`H`).

- Pointer selects, moves, resizes, and marquee-selects Nodes. Node content is `inert` behind an invisible focusable hit layer.
- Hand pans while Node React content retains native focus, controls, and scrolling.
- Space temporarily activates Hand; middle drag pans; `Ctrl/Cmd + wheel` and pinch zoom.
- Pointer context actions enter parent-pick mode. A Node selects the new parent, Canvas blank space selects the root, and `Esc` cancels.

The Node shell has no visible window title bar. Its invisible Pointer hit layer provides drag targeting, keyboard movement, focus, and an accessible name derived from `id` without consuming Canvas space.

Canvas shortcuts apply outside Node content and editable controls: `V / H`, `+ / -`, `0`, `1 / 2`, `Ctrl/Cmd + A`, arrows, `Shift + arrows`, `Esc`, and `?`. Bottom-right controls expose zoom, fit, and shortcut help.

## Inspection And Progressive Disclosure

Semantic reading follows source ownership:

```text
Canvas intent
└── selected Node sources
    └── reusable Component
        └── components/ui
```

Spatial reading is independent:

```text
overview
└── viewport query
    └── Node detail
```

Overview returns Canvas source, Node count, and root IDs. A viewport query returns intersecting structural summaries and source references without coordinates. Node detail returns exact local and absolute geometry, parent, children, and `sources[]`.

`sources[]` is derived from JSX and imports, stopping at nested Node boundaries; the Canvas file is the fallback. The active Host publishes live Store geometry. Cold inspection extracts static intent and merges shared geometry before render. Dynamic structural JSX requires the live Store rather than producing a partial cold result.

Human reparenting moves static Node JSX and converts parent-local coordinates in one transaction. The Host rejects dynamic or ambiguous source instead of writing a partial hierarchy. Geometry never stores a second hierarchy.

## Persistence And Migration

Small Canvases use one hidden v3 JSON document. Above the Host threshold, the same logical document becomes a manifest plus deterministic Node-ID shards. Shards are copy-on-write; a manifest replacement is the atomic commit. Physical representation stays behind the layout storage API.

The v1/v2 reader captures legacy viewport, writes hidden v3 geometry, imports viewport only when no local preference exists, then removes the old colocated layout and obsolete shards. This is a direct migration with no dual write.

## Owners

- `packages/react/src/canvas.tsx`: minimal authoring API, parent context, portals.
- `packages/kernel/src/canvas.mjs`: layout v3 and default geometry.
- `packages/kernel/src/canvas-inspection.mjs`: versioned inspection queries.
- `packages/cli/src/host/canvas`: Store, interaction, React Flow adapter.
- `packages/cli/src/dev-server`: registry, cold inspection, hidden layout storage.
- `agent-html/canvases`: semantic Canvas sources and generated geometry.

Performance baseline: 1,000 total Nodes with up to 100 visible Nodes. Packaged Desktop runtime verification remains required.
