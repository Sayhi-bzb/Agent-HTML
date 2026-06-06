# UI Experience

Common UI experience for Canvas primitives.

`agent-html/index/api-surface.md` answers what can be imported. This page
answers how to choose a primitive after the artifact content and interaction
are clear.

These notes are experience, not hard project rules. Canvas rules still live in
`agent-html/AGENTS.md`, `agent-html/README.md`, `agent-html/styles`, and the
Canvas docs.

## Working Posture

Start with the content and task, not a component list.

A `Block` can contain plain text, headings, lists, diagrams, forms, tables,
media, cards, panels, or custom React composition. A primitive is useful when
it expresses behavior, accessibility, state, or a reusable UI role. It is not a
default shell for artifact content.

Use local Canvas primitives for common interactive controls and reusable UI
roles. Use ordinary React structure for content that does not need a primitive.

## Interaction Fit

Choose primitives by behavior.

- Short text input: `Input`.
- Longer text input: `Textarea`.
- Related fields with labels, helper text, or validation: `Field` and
  `FieldGroup`.
- One visible semantic choice from a few options: `RadioGroup`.
- One choice from many known options: `Select` or `NativeSelect`.
- Searchable choice from a larger set: `Combobox`.
- Independent submitted boolean values: `Checkbox`.
- Immediate on/off setting: `Switch`.
- Mode, view, or segmented option switch: `ToggleGroup`.
- Numeric range or continuous value: `Slider`.
- Primary, secondary, or local command: `Button`.

## Display Fit

Choose display primitives only when they match the content role.

- Read-only status or classification: `Badge`.
- Important persistent message: `Alert`.
- Dense comparable records: `Table`.
- Related peer views in one local context: `Tabs`.
- Optional supporting sections: `Accordion`.
- Local advanced area or optional control group: `Collapsible`.
- Lightweight boundary between related regions: `Separator`.
- Bounded scroll region: `ScrollArea`.
- Loading placeholder or pending structure: `Skeleton`.
- Known progress value: `Progress`.

For repeated objects, modules, placeholders, disclosures, and interaction
scopes, a `Card` can be the right primitive. For ordinary prose, diagrams,
routes, summaries, or one-off layout, plain React structure or Canvas content
classes may be enough.

## Overlay Fit

Use overlays when direct layout would make the primary task worse.

- Brief helper text for icon-only or unfamiliar controls: `Tooltip`.
- Rich contextual preview or compact editor: `HoverCard` or `Popover`.
- Contextual action list: `DropdownMenu`.
- Focused modal task or focused form: `Dialog`.
- Destructive, irreversible, discard, overwrite, or leave confirmation:
  `AlertDialog`.
- Side task that preserves page context: `Sheet`.
- Mobile-bottom or transient task panel: `Drawer`.

Do not hide information just because the page is busy. Hide it only when the
hidden state makes the next correct action cheaper.

## Specialized Fit

Use specialized primitives only when the task asks for their interaction model:

- `Command` for command palettes and searchable action menus.
- `ContextMenu` for right-click or object-local secondary actions.
- `Menubar` for application-style menu bars.
- `Resizable` for user-adjustable split panes.
- `Carousel` for ordered media or card browsing in limited space.
- `Calendar` for date picking or calendar views.
- `Sidebar` for durable navigation chrome.
- `Chart` for charted data.

Use rich workflow components only when the task needs the full object model and
interaction behavior. Current rich components: `Kanban`.

## Working Rule

Prefer native content before custom interaction, visible choices before hidden
menus, and stable layout before clever disclosure. Reach for a primitive when
it clarifies behavior or state; otherwise let the artifact content define its
own React composition.
