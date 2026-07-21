# Infinite Canvas Design

Status: proposal; not implemented. The current Canvas constitution remains
[`apps/docs/content/docs/index.mdx`](apps/docs/content/docs/index.mdx) and
describes the implemented `Artifact / Block` architecture.

## Model

```text
Folder / Workspace
└── Canvas 1..n
    ├── Node 0..n
    │   └── React content
    └── Edge 0..n
```

A Folder is the durable project space and may contain multiple independent
Canvases. Canvas occupies the document role currently held by Artifact. It
describes a spatial composition of Nodes and Edges.

A Node is a spatial instance: it connects Canvas identity, placement, and
hierarchy to React content. The content may be a primitive, compound component,
chart, iframe, or complete application. An Edge expresses a relationship
between Nodes. In this target model, Node provides the instance boundary, so a
separate Block layer is unnecessary.

## Two Hierarchies

The source hierarchy describes where code lives:

```text
workspace/
├── canvases/
│   └── dashboard/
│       ├── dashboard.canvas.tsx
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

`*.canvas.tsx` is the global intent view: it shows the Nodes in a Canvas, their
content references, spatial intent, hierarchy, and Edge relationships. A
Canvas-specific content file contains the React content selected by a Node.
Reusable implementations remain ordinary Components.

This keeps the global composition readable without placing geometry and Edge
relationships inside content modules. It also avoids requiring one
`*.node.tsx` file for every Node.

## Authoring Direction

Canvas authoring reuses React and JSX, adding only the spatial concepts
`Canvas`, `Node`, and `Edge`. This example illustrates the direction rather
than a final API:

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

      <Node id="revenue" x={480} y={120} width={640} height={360}>
        <RevenueChart />
      </Node>

      <Edge source="profile" target="revenue" />
    </Canvas>
  )
}
```

React `children`, props, Components, HTML, and CSS retain their familiar roles.
Explicit `x / y / width / height` supports precise placement. Omitted geometry
can be resolved from layout intent and stored as concrete spatial facts for
rendering and inspection. The Canvas model stays open to arbitrary Node content
and does not define semantic categories or a minimum coordinate unit.

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

The Canvas file provides the global intent. A map-style viewport query provides
resolved Nodes, Edges, geometry, and source references for one region. This
Tile view is derived from Canvas data rather than being another content file.
Small Canvases can move directly from the global intent to selected content.

## Open Questions

- Minimal syntax for omitted geometry and relative or managed layout.
- Physical storage for very large Canvases while retaining a readable global
  intent view.
- Inspection interfaces for overview, viewport, Node detail, and source
  resolution.
