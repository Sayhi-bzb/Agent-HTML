# Design System: Agent HTML Workspace Shell
**Project ID:** local-vite-react-shell

## 1. Visual Theme & Atmosphere
This product uses a calm workspace-shell aesthetic rather than a marketing or editorial aesthetic.
The interface should feel operational, neutral, and dependable. It is designed for scanning status,
moving through tools, and staying oriented during longer sessions.

The emotional tone is intentionally low-drama:

- quiet rather than expressive
- technical rather than lifestyle-driven
- structured rather than decorative
- compact rather than spacious-for-effect

The left navigation rail is the strongest compositional signal.
It makes the app read like a console or workbench, not a landing page.

## 2. Visual Character
The shell is neutral-first.
Light mode is paper-clean and border-led.
Dark mode is control-room dark and low-glare.

The system should continue to feel:

- border-defined rather than shadow-defined
- utility-dense rather than airy
- modular rather than narrative
- consistent across screens rather than visually reinvented per route

Accent color should remain sparse and purposeful.
It exists to support orientation and action priority, not to create a brand-saturated surface.

## 3. Typography Character
Typography should feel contemporary, technical, and restrained.
It should support hierarchy through weight, scale, and contrast rather than through ornamental
styling.

The preferred reading impression is:

- compact
- legible
- semibold at key hierarchy points
- low in decorative tracking and flourish

Product screens should never feel like they are borrowing a marketing hero system.

## 4. Interaction Character
Controls should feel compact, direct, and predictable.
Hover, focus, active, invalid, and disabled states should remain clear without becoming loud.

The interaction language should read as:

- quiet confidence
- fast scanning
- low ambiguity
- low visual friction

## 5. Layout Character
Pages should inherit a clear shell hierarchy:

- sticky top chrome
- left-side navigation spine
- modular content well
- responsive collapse through reflow, not redesign

The main content area should favor dashboard-like modules, panels, and structured sections over
long, undifferentiated reading flows.

## 6. Spatial Philosophy
This product is organized around two spatial roles: `shell` and `workspace`.

The shell is the durable container for navigation, global actions, open-context tabs, and product
orientation.
The workspace is the focused surface where reading, editing, reviewing, and tool execution happen.

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

## 7. Surface Hierarchy
The product should establish hierarchy through surfaces before it relies on borders.

Preferred reading order:

- shell surface first
- workspace surface second
- cards and modules inside the workspace third

Implications:

- shell-level regions should share a base color family whenever possible
- borders should organize local structure, not serve as the main tool for separating major zones
- shadows should stay light and structural rather than theatrical
- selected states may claim a stronger surface when they represent a focused workspace context

In the current implementation, the shell reads from `background` while the main workspace surface
reads from `card`.

The interface should feel assembled from calm planes rather than carved into many outlined boxes.

## 8. Interaction Philosophy
Interaction feedback should reinforce spatial roles instead of competing with them.

Shell interactions should stay stable and quiet.
Hover and focus states in navigation chrome should usually prefer text, icon, and small local
surface changes over large flashing blocks of color.

Workspace interactions may use stronger emphasis, but they should still feel operational rather
than promotional.

The goal is not visual excitement.
The goal is durable orientation during long working sessions.

## 9. Design Philosophy
The system should stay aligned with these principles:

- Prefer neutral surfaces over brand-colored surfaces.
- Prefer thin borders over dramatic depth.
- Prefer compact utility spacing over theatrical whitespace.
- Prefer stable shell patterns over one-off page expression.
- Prefer compositional discipline over stylistic novelty.

Implementation rules, token structure, typography roles, layout standards, and component standards
are defined in `design/`.
