# Gallery Vision

## Intent
`gallery` should evolve from a browse-only design-study mode into an editor-shaped workspace in
the spirit of a `shadcn` visual editor.

This does not mean cloning `tweakcn` feature-for-feature.
It means adopting the editor operating model that makes tools like that effective:

- a persistent editing area
- a dedicated preview surface
- multiple preview scenes
- a clear separation between controls and rendered output

The goal is to give `gallery` a stronger product identity than "reference board" or "mode
placeholder".
It should eventually read as the place where shell ideas are shaped, studied, and iterated.

## Operating Model
The long-term model for `gallery` is:

- `sidebar` as the editor area
- `work area` as the preview surface
- preview scenes expressed as tabs
- the shell remaining stable while the preview content changes

This matches the direction already emerging in the app:

- `workspace` mode owns project tabs and project-backed work surfaces
- `gallery` mode owns design-study scenes and editor-oriented shell behavior

In this model, `gallery` is not just a place to look at examples.
It becomes a dedicated editing environment inside the same application shell.

## Product Boundary
The first important rule is isolation.

`gallery` editing is intentionally separate from the real app state.
It should not directly control or mutate the live application shell, theme tokens, or project
surfaces while the editor model is still being defined.

The point of this separation is to let the product team validate the editor structure first:

- whether the sidebar truly works as an editor surface
- whether scene-based preview tabs feel right
- whether the gallery shell deserves to be a distinct operating mode

Only after that structure feels correct should any real connection to production-facing tokens or
runtime styles be considered.

The asset model should follow the same separation.
`gallery` should maintain its own feature-domain asset layer rather than pretending that the base
primitive library is enough.
This means preview scenes, scene metadata, and editor-facing gallery assets should live in a
dedicated Gallery domain, not be scattered across generic shell components.

## Preview Philosophy
The preview surface should behave more like an editor preview rail than like a normal page.

`gallery` scenes should eventually let the user study the shell through different lenses:

- overall shell composition
- inset workspace composition
- reference-detail views
- other future scene families

For now, scene tabs do not need real functionality depth.
They can remain structural placeholders as long as they establish the right navigation model:

- the preview surface changes
- the editor surface remains stable
- the user understands that tabs switch scenes, not tools

## What This Is Not Yet
This vision should not be misread as a commitment to build a full `tweakcn` clone.

It is not yet:

- a real token editor
- a live runtime theme engine
- a production-connected shell customizer
- a full design-system export workflow
- a requirement to preinstall every `shadcn` component package or example into the app

It is a product-direction statement:
`gallery` should mature into a self-contained visual editor shell, with `shadcn`-editor-like
structure as the reference model.

That structure should be implemented as a dedicated Gallery feature domain, currently expected to
live under `src/gallery/*`.
