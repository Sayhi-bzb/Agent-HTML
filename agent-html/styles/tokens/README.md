# Style Tokens

This directory owns Canvas CSS token values and token mappings.

Use this route after `../README.md` when the task asks for color, type, radius, density, reading width, host chrome, or theme editor tokens.

## Ownership

- `foundation.css`: global semantic theme values.
- `features/content.css`: artifact-consumable content tokens.
- `features/code-block.css`: CodeBlock implementation tokens.
- `features/artifact.css`: artifact reading container dimensions.
- `features/host.css`: host, sidebar, prompt, toolbar, and block chrome tokens.
- `features/theme-editor.css`: theme editor controls.
- `tailwind.css`: Tailwind and shadcn utility mapping only.
- `index.css`: token import map only.

## Boundary

Do not change `tailwind.css` to tune a single artifact. Tune the owning token file first, then let the mapping consume it.

## Feature Token Admission

Keep feature tokens for values that define a reusable scale, semantic role, or
theme-adjustable surface. Inline local implementation constants in
`styles/internal/*` when a value only sizes one skeleton part, one icon, one
status line, or one component-internal offset.

Host tokens should describe host chrome scale, not every host CSS number.
