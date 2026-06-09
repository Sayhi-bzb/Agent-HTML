# Canvas Taste

This file owns portable Canvas artifact design judgment inside distributed `agent-html`.

It is not a hard-rule file, API surface, primitive catalog, or host architecture guide. `AGENTS.md` owns executable rules. Component and style routes own source selection. `TASTE.md` owns the visual and compositional judgment agents need when an artifact must feel like a coherent work surface instead of a component inventory.

## Artifact Judgment

- Treat artifact content as a scene before treating it as a component list.
- Let the primary media, object, or workflow establish the stage before adding UI containers.
- Make one visual or object lead each major block.
- Use UI as annotation, orientation, and control around the work; do not let UI containers become the work.
- Prefer existing Canvas primitives and public content classes before inventing new component families.

## Layout Judgment

- Prefer spacing, alignment, type, captions, and state markers before adding another bordered surface.
- Use panels only for real objects, control groups, placeholders, disclosures, or data scopes.
- Do not wrap every image, caption, source link, and note in separate bordered surfaces.
- Avoid card-inside-card depth unless each layer has a distinct object identity.
- Let image-heavy artifacts use images as layout structure, not only as content inside cards.

## Media Judgment

- Media should carry semantic work, not just decoration.
- Repeated images in one scene should have distinct jobs: context, scale, detail, sequence, evidence, or closure.
- Replace visually similar supporting images when they repeat the same idea.
- Keep credits and sources traceable without interrupting the narrative rhythm.
- Use inline image credits near media and collect long source lists in a final source area when repeated links would break the story.

## Component Judgment

- Use `components/ui` primitives for ordinary actions, labels, display, disclosure, overlays, and navigation.
- Use existing rich components only when their behavior matches the task.
- Reuse `Timeline` for chronological or route structure before making a custom route component.
- Do not create a new rich component for a one-off artifact arrangement.
- Promote a local pattern only when repeated behavior or a reusable arrangement appears.

## Review Checklist

- The first viewport identifies the artifact subject without reading the file name.
- Each major block has one leading visual, object, or workflow.
- Borders are not the default hierarchy mechanism.
- Panels mark meaningful boundaries instead of routine spacing.
- Source links and credits are traceable without dominating the page.
- Repeated images in the same block say different things.
- Existing primitives are composed before new components are invented.
- The artifact reads as a coherent scene or workflow, not a pile of containers.
