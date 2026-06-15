# Style Kits

This directory owns reusable Canvas standard kit values.

Use this route after `../README.md` when the task asks for artifact reading
width, content spacing, content typography, frame dimensions, or rich component
semantic values.

## Ownership

- `content.css`: artifact-consumable content kit.
- `artifact.css`: artifact reading container dimensions.
- `code-block.css`: CodeBlock implementation kit.
- `index.css`: kit import map only.

## Boundary

Kits define reusable scales, semantic roles, and theme-adjustable surfaces.
Raw global material values stay in `../materials/foundation.css`. Tailwind and
shadcn utility mappings stay in `../materials/tailwind.css`. Agent-consumable
composition classes stay in `../layouts`.

Inline local implementation constants in `../internal/*` when a value only
sizes one skeleton part, one icon, one status line, or one component-internal
offset.
