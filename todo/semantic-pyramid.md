# Semantic Pyramid

This file owns the promotion model from raw values to higher-level Canvas
semantics.

```text
                         +-----------------------------+
                         | L4 Component / Pattern      |
                         | SourceLinks, MediaFigure    |
                         | structured DOM + data shape |
                         +--------------^--------------+
                                        |
                         +--------------+--------------+
                         | L3 Semantic Role Class      |
                         | canvas-text-note            |
                         | canvas-surface-muted        |
                         +--------------^--------------+
                                        |
                         +--------------+--------------+
                         | L2 Public Composition Class |
                         | canvas-text-caption         |
                         | canvas-stack-sm             |
                         +--------------^--------------+
                                        |
                         +--------------+--------------+
                         | L1 Named Token              |
                         | background, muted, success  |
                         | content spacing and type    |
                         +--------------^--------------+
                                        |
                         +--------------+--------------+
                         | L0 Raw Value                |
                         | rem, oklch, px, shadow      |
                         +-----------------------------+
```

## Layer Definitions

### L0 Raw Value

Unsemantic visual, layout, or drawing value.

Examples:

```text
0.75rem
oklch(0.556 0 0)
9999px
0px 1px 3px 0px rgb(0 0 0 / 0.10)
grid-cols-[minmax(0,0.62fr)_minmax(240px,0.38fr)]
```

### L1 Named Token

Named value with a stable role.

Examples:

```text
--background
--muted-foreground
--success
--canvas-content-caption-font-size
--canvas-content-gap-sm
```

### L2 Public Composition Class

Composable public class that exposes L1 values or layout primitives to
artifact source.

Examples:

```text
canvas-text-caption
canvas-text-body
canvas-stack-sm
canvas-wrap-sm
canvas-content-panel
```

### L3 Semantic Role Class

Higher-level artifact-facing semantic role built from stable L1/L2
combinations.

Examples:

```text
canvas-text-note
canvas-surface-muted
canvas-meta-row
```

These should be admitted only when a role is frequent, stable, artifact-neutral,
and easy for agents to choose correctly.

### L4 Component Or Pattern

Structured reusable DOM, behavior, or data-shape pattern.

Examples:

```text
SourceLinks
MediaFigure
StatusBadge
artifactPublicUrlFactory
```

## Promotion Rules

```text
Raw value repeated with a stable UI role
  -> promote to L1 token.

L1/L2 combination repeated with a stable content role
  -> promote to L3 semantic class.

Structured DOM plus stable data shape repeated
  -> promote to L4 component or pattern.

Algorithmic drawing or domain-specific geometry
  -> keep local unless a primitive needs it.
```

## L3 Admission Checks

Add an L3 semantic class only when all checks pass:

```text
1. Frequency is high enough to shape agent behavior.
2. The class combination is stable.
3. The semantic role is stable.
4. The role is not tied to one artifact subject.
5. The class name is predictable.
6. The abstraction does not hide important layout differences.
```

Good L3 candidates:

```text
canvas-text-note
canvas-text-muted-caption
canvas-surface-muted
canvas-surface-panel
canvas-meta-row
```

Weak L3 candidates:

```text
canvas-pretty-row
canvas-soft-thing
canvas-cardish
canvas-inline-center
```

`canvas-inline-center` is weak because it names layout mechanics, not content
meaning. Keep that at L2 composition level unless a clearer semantic role
emerges.

## Examples

### Caption Note

```text
0.75rem
  -> --canvas-content-caption-font-size
    -> canvas-text-caption
      -> canvas-text-note
```

The repeated combination is:

```text
canvas-text-caption text-muted-foreground
```

Possible L3 role:

```text
canvas-text-note
```

### Muted Surface

```text
color + opacity
  -> --muted
    -> bg-muted/40
      -> canvas-surface-muted
```

The repeated combination is a quiet content surface. If used consistently, it
should become an L3 semantic surface.

### Artifact Public URL

```text
/__agent-html/artifacts/<artifact>/public/<path>
  -> artifactPublicUrlFactory("<artifact>")
```

The repeated raw path prefix became a helper because it was long, stable,
frequent, and easy to mistype.

## Non-Promotion Examples

Keep these local unless they become primitive APIs:

```text
one-off grid formulas
one-off chart dimensions
map route colors with subject meaning
rough sketch seeds
SVG path geometry
```

These values describe local structure or drawing math rather than shared UI
roles.
