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

## 6. Design Philosophy
The system should stay aligned with these principles:

- Prefer neutral surfaces over brand-colored surfaces.
- Prefer thin borders over dramatic depth.
- Prefer compact utility spacing over theatrical whitespace.
- Prefer stable shell patterns over one-off page expression.
- Prefer compositional discipline over stylistic novelty.

Implementation rules, token structure, typography roles, layout standards, and component standards
are defined in `design/`.
