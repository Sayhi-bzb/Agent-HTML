# Design System: Agent HTML Operating Shell
**Project ID:** local-vite-react-shell

## 1. Visual Theme & Atmosphere
This product uses a calm operating-shell aesthetic rather than a marketing or editorial aesthetic.
The interface should feel operational, neutral, and dependable. It is designed for moving between
working contexts, scanning structural cues, and staying oriented during longer sessions.

The emotional tone is intentionally low-drama:

- quiet rather than expressive
- technical rather than lifestyle-driven
- structured rather than decorative
- compact rather than spacious-for-effect

The left navigation rail is the strongest compositional signal.
It makes the app read like a console or workbench, not a landing page.

## 2. Operating Model
The current product is organized around one durable shell with two operating modes:

- `workspace` mode for project navigation and project-backed work tabs
- `gallery` mode for shell studies, fixed view tabs, theme editing, and component-market review

The shell stays materially stable while the active work surface changes role.
This is a mode swap, not a route-family fork.

The header, sidebar, and footer remain part of the same operational frame in both modes.
What changes is the content they host:

- project tabs vs. fixed Gallery view tabs in the header
- navigation list vs. active Gallery controls in the sidebar body
- utility footer vs. active-view Gallery actions or metrics

## 3. Visual Character
The shell is neutral-first.
Light mode is paper-clean and border-led.
Dark mode is control-room dark and low-glare.

The system should continue to feel:

- border-defined rather than shadow-defined
- utility-dense rather than airy
- modular rather than narrative
- low-chrome rather than container-heavy
- consistent across modes rather than visually reinvented per view

Accent color should remain sparse and purposeful.
It exists to support orientation and action priority, not to create a brand-saturated surface.

## 4. Typography Character
Typography should feel contemporary, technical, and restrained.
It should support hierarchy through weight, scale, and contrast rather than through ornamental
styling.

The preferred reading impression is:

- compact
- legible
- semibold at key hierarchy points
- low in decorative tracking and flourish

Product screens should never feel like they are borrowing a marketing hero system.

## 5. Interaction Character
Controls should feel compact, direct, and predictable.
Hover, focus, active, invalid, and disabled states should remain clear without becoming loud.

The interaction language should read as:

- quiet confidence
- fast scanning
- low ambiguity
- low visual friction

## 6. Layout Character
Pages should inherit a clear shell hierarchy:

- sticky top chrome
- left-side navigation spine
- mode-aware content well
- responsive collapse through reflow, not redesign

The main content area should favor dashboard-like modules, panels, and structured sections over
long, undifferentiated reading flows.

In `gallery` mode, the main content area becomes a scene-preview surface rather than a standard
project workspace, but it must still read as a hosted work plane inside the same shell.

## 7. Spatial Philosophy
This product is organized around two spatial roles: `shell` and `workspace`.

The shell is the durable container for navigation, global actions, open-context tabs, and product
orientation.
The workspace is the focused surface where reading, editing, reviewing, scene inspection, and tool
execution happen.

These roles must feel different:

- the shell should read as one continuous operational frame
- the workspace should read as a distinct work surface nested inside that frame
- primary separation should come from surface hierarchy, not from drawing more lines

This is why the header, sidebar, and tab strip should visually belong to the same family.
They are not separate panels that happen to touch.
They are different control zones inside the same shell.

This is also why the main content well should feel inset rather than merely adjacent.
Rounded corners, margin offsets, and surface contrast should make the workspace feel placed into
the shell, like a work board inside a chassis.

## 8. Surface Hierarchy
The product should establish hierarchy through surfaces before it relies on borders.

Preferred reading order:

- shell surface first
- workspace surface second
- cards and modules inside the workspace third

Implications:

- shell-level regions should share a base color family whenever possible
- borders should organize local structure, not serve as the main tool for separating major zones
- shadows should stay light and structural rather than theatrical
- selected states may claim a stronger surface when they represent a focused context

In the current implementation, the shell reads from `background` while the inset workspace well is
established through placement, radius, and border-led separation rather than through a single
uniform `card` surface.

The interface should feel assembled from calm planes rather than carved into many outlined boxes.

The preferred surface model is low-chrome layered planes: a small number of stable surfaces should
carry the shell, workspace, and module hierarchy. Avoid nested container UI, where each region is
wrapped in another visible card, panel, border, radius, or background merely to create depth.
This stacked-cake effect weakens scan speed and makes the product feel heavier than its operating
model requires.

Containers are still valid when they express a real structural boundary, object identity, or
interaction scope. They should not be used as the default way to make every subsection visible.
Inside an existing module, prefer spacing, typography, separators, alignment, and state treatment
before adding another container surface.

## 9. Interaction Philosophy
Interaction feedback should reinforce spatial roles instead of competing with them.

Shell interactions should stay stable and quiet.
Hover and focus states in navigation chrome should usually prefer text, icon, and small local
surface changes over large flashing blocks of color.

Workspace interactions may use stronger emphasis, but they should still feel operational rather
than promotional.

The goal is not visual excitement.
The goal is durable orientation during long working sessions.

In the current shell:

- secondary sidebar controls default to weakened text
- hover may strengthen text without introducing a new background
- active sidebar items should rely on background and foreground, not on heavier font weight

## 10. Design Philosophy
The system should stay aligned with these principles:

- Prefer neutral surfaces over brand-colored surfaces.
- Prefer thin borders over dramatic depth.
- Prefer compact utility spacing over theatrical whitespace.
- Prefer stable shell patterns over one-off page expression.
- Prefer mode swaps inside the shell over fragmenting the product into unrelated frames.
- Prefer compositional discipline over stylistic novelty.
- Prefer low-chrome layered planes over nested container depth.

Implementation rules, token structure, typography roles, layout standards, and component standards
are defined in `design/`.
