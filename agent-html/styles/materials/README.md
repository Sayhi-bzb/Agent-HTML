# Style Materials

This directory owns Canvas CSS material values and token mappings.

Use this route after `../README.md` when the task asks for raw color, type,
radius, density, chart primitives, or Tailwind mapping.

## Ownership

- `foundation.css`: raw global material values.
- `tailwind.css`: Tailwind and shadcn utility mapping only.
- `index.css`: material import map only.

## Boundary

Do not change `tailwind.css` to tune a single artifact. Tune the owning material
or standard kit file first, then let the mapping consume it.

Canvas-owned semantic tokens use the `--canvas-*` namespace. Unprefixed tokens
are theme primitives. Host sidebar tokens use `--canvas-host-sidebar-*` and are
owned by the Host surface; artifact content must use public content classes or
theme primitives such as `background`, `card`, and `muted`. `ring` is reserved
for focus, outline, and host highlight affordances, not body text emphasis.

## Tailwind Mapping

`tailwind.css` is a Tailwind and shadcn mapping layer only. It may map owner
tokens with `var(...)`, and it may derive the approved Tailwind radius scale
from `--radius` with `calc(var(--radius) * n)`.

Do not put raw colors, raw lengths, kit-owned values, chart tuning values, host
tuning values, or artifact-specific values in `tailwind.css`. Add or tune the
value in the owning material or `../kits/*` file first, then expose the mapping
here only when Tailwind utilities need it.

## Foundation Scope

`foundation.css` owns:

- theme primitives: background, foreground, card, popover, primary, secondary,
  muted, accent, destructive
- global status primitives: success, warning, info
- chart primitives: chart 1 through 5
- global shape, spacing, type, and depth primitives
- Canvas base affordances such as text selection

Do not add feature-scoped values, host-only scale, content-scale values, or
component-internal offsets to `foundation.css`.

Host chrome values live in `packages/cli/src/host/styles`. `tailwind.css` only
maps their names for Host utility consumption; `foundation.css` and theme
presets must not define them.
