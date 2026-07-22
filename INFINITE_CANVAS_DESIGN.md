# Infinite Canvas Design

Status: initial vertical slice implemented beside `Artifact / Block`. The current Canvas constitution remains [`apps/docs/content/docs/index.mdx`](apps/docs/content/docs/index.mdx).

## Model

```text
Folder / Workspace
└── Canvas 1..n
    └── Node 0..n
        └── React content
```

A Folder is the durable project space and may contain multiple independent Canvases. Canvas occupies the document role currently held by Artifact. It describes a spatial composition of Nodes.

The logical Canvas combines authored intent with resolved layout:

```text
Canvas
├── Intent (*.canvas.tsx)
├── Layout (*.layout.json)
└── Resolved Canvas Store
```

Intent describes Node identity, content, hierarchy, and optional source geometry. Layout records the concrete geometry produced by direct manipulation. The resolved Store combines both for rendering and inspection.

A Node is a spatial instance: it connects Canvas identity, placement, and hierarchy to React content. The content may be a primitive, compound component, chart, iframe, or complete application. Node provides the instance boundary, so a separate Block layer is unnecessary. Canvas does not model arbitrary cross-Node relationships; spatial proximity and `parentId` are its only built-in relationships. Data flow, navigation, and domain relationships belong to Node content or a future model with explicit behavior.

## Two Hierarchies

The source hierarchy describes where code lives:

```text
workspace/
├── canvases/
│   └── dashboard/
│       ├── dashboard.canvas.tsx
│       ├── dashboard.layout.json
│       └── content/
│           ├── profile.tsx
│           └── revenue-chart.tsx
├── components/
│   ├── ProfileCard.tsx
│   └── RevenueChart.tsx
└── components/ui/
```

The React Slot hierarchy describes how content composes:

```text
Canvas
└── Node
    └── React content / Component
        └── components/ui
```

`*.canvas.tsx` is the global intent view: it shows the Nodes in a Canvas, their content references, spatial intent, and hierarchy. `*.layout.json` is machine-managed resolved geometry keyed by Node identity. A Canvas-specific content file contains the React content selected by a Node. Reusable implementations remain ordinary Components.

This keeps the global composition readable without placing machine geometry inside content modules. It also avoids requiring one `*.node.tsx` file for every Node.

## Authoring Direction

Canvas authoring reuses React and JSX, adding only the spatial concepts `Canvas` and `Node`:

```tsx
import { Canvas, Node } from "@agent-html/react"
import { Profile } from "./content/profile"
import { RevenueChart } from "./content/revenue-chart"

export default function DashboardCanvas() {
  return (
    <Canvas id="dashboard">
      <Node id="profile" sourcePath="./content/profile.tsx">
        <Profile />
      </Node>

      <Node id="revenue">
        <RevenueChart />
      </Node>
    </Canvas>
  )
}
```

React `children`, props, Components, HTML, and CSS retain their familiar roles. Explicit `x / y / width / height` supports precise placement. Omitted geometry can be resolved from layout intent and stored as concrete spatial facts for rendering and inspection. The Canvas model stays open to arbitrary Node content and does not define semantic categories or a minimum coordinate unit.

## Rendering Boundary

```text
Canvas intent + layout state
            ↓
    Canonical Canvas Store
            ↓
     React Flow Adapter
            ↓
       @xyflow/react
```

The Canonical Store is the product model. The React Flow adapter projects its Nodes into the viewport and translates selection, movement, and resize interactions back into layout transactions. `@use-gesture/react` normalizes Host pan input while React Flow owns viewport coordinates and zoom. Neither defines Canvas source, persistence, or public record types.

## Interaction Contract

The bottom-center Dock selects Pointer (`V`) or Hand (`H`). Pointer is the default spatial-edit tool: Node drag moves, handles resize, and empty-space drag selects. Node content is `inert` behind a Host hit layer. Hand is the navigate/use tool: primary drag pans while embedded controls and scrollable content retain native interaction. Space temporarily activates Hand from Pointer; middle drag pans and `Ctrl/Cmd + wheel` or pinch zooms in either tool.

A Host-private XState actor owns persistent tool, transient phase, focus owner, and selection. The Canonical Store does not contain interaction-session state. React Flow remains the geometry and viewport engine; `@use-gesture/react` owns wheel pan and Hand primary drag. High-frequency coordinates bypass the actor.

Input routing classifies Canvas pane, Node chrome, Node content, Dock, and overlays. Pointer makes Node content unfocusable through native `inert`; switching tools does not unmount its React subtree. Hand preserves wheel input only while a scrollable content ancestor can consume it. Cursor derives from effective tool, phase, and input region.

Canvas shortcuts apply only when focus is outside Node content and editable controls:

- `V / H`: Pointer / Hand.
- `+ / -`: zoom in / out.
- `0`: reset zoom to 100%.
- `1 / 2`: fit all / fit selection.
- `Ctrl/Cmd + A`: select all Nodes.
- `Arrow`: move selected Nodes by 1 px; `Shift + Arrow`: move by 10 px.
- `Esc`: clear selection or close shortcut help.
- `?`: show shortcut help.

Bottom-right controls expose zoom out, current percentage / 100% reset, zoom in, fit all, and shortcut help. Canvas does not expose a map panel.

Layout document v2 adds optional `{ x, y, zoom }` viewport state. Move-end persists the viewport through the same serialized layout queue as Node geometry. Loading v1 migrates to v2; a Canvas without persisted viewport starts fitted to all Nodes.

## Progressive Disclosure

Source reading follows content ownership:

```text
Canvas intent
└── selected Node content
    └── reusable Component
        └── components/ui
```

Spatial inspection is a separate path:

```text
Canvas overview
└── viewport / Tile query
    └── Node detail
```

The Canvas file provides the global intent. A map-style viewport query provides resolved Nodes, geometry, hierarchy, and source references for one region. This Tile view is derived from Canvas data rather than being another content file. Small Canvases can move directly from the global intent to selected content.

The Canonical Store exposes overview, viewport, Node detail, and source resolution queries. Viewport results use absolute geometry while layout remains parent-local and retain the total Node count. `sourcePath` optionally identifies the content module selected by a Node; the Canvas source remains the fallback reference. The active Host publishes a versioned inspection document to an authenticated HTTP route for UI-independent agent inspection.

The same route provides cold inspection before a Canvas renders by extracting static `Canvas / Node` intent and merging the colocated layout with Kernel-owned default geometry. Responses identify `live` or `cold` origin. Dynamic Canvas children, spread intent props, and non-static spatial props require the live Store; cold inspection rejects them instead of returning partial data.

## Initial Slice

The Canvas surface runs beside the current Artifact surface. It supports position, size, parent-local placement, viewport state, direct interaction with React content, and persisted move/resize/viewport results. Canvas structure continues to come from TSX while the UI changes layout geometry. The performance baseline is 1,000 total Nodes with up to 100 visible Nodes.

`@xyflow/react`, `@use-gesture/react`, XState, and its React adapter are private Host infrastructure. Public Canvas records contain no library types. The Host keeps one Canonical Store per selected Canvas, preserves it across source HMR, and hydrates the colocated layout after restart. The Desktop navigation snapshot carries Artifact and Canvas entries.

Implementation owners:

- `packages/react/src/canvas.tsx`: authored `Canvas / Node` intent and portal projection.
- `packages/kernel/src/canvas.mjs`: versioned layout document.
- `packages/cli/src/host/canvas`: Canonical Store and React Flow adapter.
- `packages/cli/src/dev-server/canvas-registry.mjs`: discovery and registry.
- `agent-html/canvases`: Canvas sources and machine-managed layouts.

## Large Canvas Storage

Small Canvases keep the colocated `*.layout.json` document. Above a Host-owned size threshold, the physical layout becomes a manifest plus deterministic Node-ID shards. The manifest maps each shard to an immutable generation so changed shards can be written before one atomic pointer replacement. Node-ID sharding keeps parent-local records stable when geometry moves; spatial Tiles are derived query indexes, not primary storage.

The layout HTTP and Canonical Store contracts remain independent of the physical representation. Host interaction persists only dirty Node geometry; monolithic storage merges the patch, while sharded storage copy-on-writes only affected shards. Authored Node removal emits an ID tombstone that removes the corresponding layout record. After each atomic manifest replacement, the Host removes generation directories no longer referenced by any shard. Hydration reconstructs the same versioned layout document.

The root `*.canvas.tsx` remains the ownership and global intent route. Large semantic regions may move into zero-prop named local React components without adding another product-model primitive. Cold inspection recursively expands their static relative imports in source order while treating content inside a Node as opaque React content.

## Remaining Validation

- Exercise the 1,000-total / 100-visible performance baseline in the packaged Desktop runtime.
