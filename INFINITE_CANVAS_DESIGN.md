# Infinite Canvas Design

Status: initial vertical slice implemented beside `Artifact / Block`. The current Canvas constitution remains [`apps/docs/content/docs/index.mdx`](apps/docs/content/docs/index.mdx).

## Model

```text
Folder / Workspace
└── Canvas 1..n
    ├── Node 0..n
    │   └── React content
    └── Edge 0..n
```

A Folder is the durable project space and may contain multiple independent Canvases. Canvas occupies the document role currently held by Artifact. It describes a spatial composition of Nodes and Edges.

The logical Canvas combines authored intent with resolved layout:

```text
Canvas
├── Intent (*.canvas.tsx)
├── Layout (*.layout.json)
└── Resolved Canvas Store
```

Intent describes content and relationships. Layout records the concrete geometry produced by direct manipulation. The resolved Store combines both for rendering and inspection.

A Node is a spatial instance: it connects Canvas identity, placement, and hierarchy to React content. The content may be a primitive, compound component, chart, iframe, or complete application. An Edge expresses a relationship between Nodes. In this target model, Node provides the instance boundary, so a separate Block layer is unnecessary.

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
├── Node
│   └── React content / Component
│       └── components/ui
└── Edge
```

`*.canvas.tsx` is the global intent view: it shows the Nodes in a Canvas, their content references, spatial intent, hierarchy, and Edge relationships. `*.layout.json` is machine-managed resolved geometry keyed by Node identity. A Canvas-specific content file contains the React content selected by a Node. Reusable implementations remain ordinary Components.

This keeps the global composition readable without placing geometry and Edge relationships inside content modules. It also avoids requiring one `*.node.tsx` file for every Node.

## Authoring Direction

Canvas authoring reuses React and JSX, adding only the spatial concepts `Canvas`, `Node`, and `Edge`:

```tsx
import { Canvas, Edge, Node } from "@agent-html/react"
import { Profile } from "./content/profile"
import { RevenueChart } from "./content/revenue-chart"

export default function DashboardCanvas() {
  return (
    <Canvas id="dashboard">
      <Node id="profile">
        <Profile />
      </Node>

      <Node id="revenue">
        <RevenueChart />
      </Node>

      <Edge id="profile-revenue" source="profile" target="revenue" />
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

The Canonical Store is the product model. The React Flow adapter projects its Nodes and Edges into the viewport and translates selection, movement, and resize interactions back into layout transactions. React Flow supplies the initial viewport and interaction foundation without defining Canvas source, persistence, or public record types.

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

The Canvas file provides the global intent. A map-style viewport query provides resolved Nodes, Edges, geometry, and source references for one region. This Tile view is derived from Canvas data rather than being another content file. Small Canvases can move directly from the global intent to selected content.

## Initial Slice

The Canvas surface runs beside the current Artifact surface. It supports position, size, parent-local placement, authored Edges, direct interaction with React content, and persisted move/resize results. Canvas structure continues to come from TSX while the UI changes layout geometry. The performance baseline is 1,000 total Nodes with up to 100 visible Nodes.

`@xyflow/react` is private Host infrastructure. Public Canvas records contain no React Flow types. The Host keeps one Canonical Store per selected Canvas, preserves it across source HMR, and hydrates the colocated layout after restart. The Desktop navigation snapshot carries Artifact and Canvas entries.

Implementation owners:

- `packages/react/src/canvas.tsx`: authored `Canvas / Node / Edge` intent and portal projection.
- `packages/kernel/src/canvas.mjs`: versioned layout document.
- `packages/cli/src/host/canvas`: Canonical Store and React Flow adapter.
- `packages/cli/src/dev-server/canvas-registry.mjs`: discovery and registry.
- `agent-html/canvases`: Canvas sources and machine-managed layouts.

## Open Questions

- Physical storage for very large Canvases while retaining a readable global intent view.
- Inspection interfaces for overview, viewport, Node detail, and source resolution.
