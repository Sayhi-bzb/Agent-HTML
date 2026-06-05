# UI Experience

Common UI experience for choosing Canvas primitives.

`.agent-html/index/api-surface.md` answers what can be imported. This page
answers what to choose first when an artifact task leaves the UI shape open.

These notes are experience, not hard project rules. Canvas rules still live in
`.agent-html/AGENTS.md`, `.agent-html/README.md`, `.agent-html/styles`, and the
Canvas docs.

## Default Choices

Choose the smallest component that expresses the interaction.

| Need | Default |
| --- | --- |
| Primary or secondary action | `Button` |
| One choice from 2-5 visible options | `RadioGroup` |
| One choice from many known options | `Select` |
| Searchable choice from many options | `Combobox` |
| Multiple independent choices | `Checkbox` group |
| Binary setting with immediate effect | `Switch` |
| Binary value submitted with a form | `Checkbox` |
| Short free text | `Input` |
| Longer free text | `Textarea` |
| Numeric range or continuous value | `Slider` |
| Related views in one context | `Tabs` |
| Optional supporting sections | `Accordion` |
| Locally hidden advanced controls | `Collapsible` |
| Contextual actions | `DropdownMenu` |
| Destructive confirmation | `AlertDialog` |
| Modal task or focused form | `Dialog` |
| Side task that preserves page context | `Sheet` |
| Mobile-bottom or transient task panel | `Drawer` |
| Read-only status | `Badge` |
| Classification, filter, or removable label | tag-like `Badge` composition |
| Important persistent message | `Alert` |
| Loading placeholder | `Skeleton` |
| Known progress value | `Progress` |
| Dense structured records | `Table` |
| Repeated summary objects | `Card` |
| Divide related regions | `Separator` |
| Scrollable bounded region | `ScrollArea` |
| Brief label for icon-only or unfamiliar control | `Tooltip` |
| Rich contextual preview | `HoverCard` or `Popover` |

## Disclosure

Do not hide information just because the page is busy. Hide it only when the
hidden state makes the next correct action cheaper.

Show content directly when it is required for the primary task, must be
compared with nearby content, or is short enough that hiding it adds more work
than it removes.

Use grouping when related content needs structure but should stay visible:
`Card` for repeated summary objects, `Table` for dense comparable records,
`Separator` for lightweight boundaries, and `Tabs` for peer views in one
context.

Use `Accordion` when headings can summarize optional content. Do not collapse
content that users must compare or read to complete the main task.

Use `Collapsible` for a local advanced area, details section, or optional
control group inside an existing layout.

Use `Tooltip` for short labels or clarifications, especially icon-only or
unfamiliar controls. Do not put essential instructions only in a tooltip.

Use `HoverCard` or `Popover` when the user needs richer contextual detail
without leaving the current surface.

Use `Dialog` for focused modal tasks, `AlertDialog` for destructive or
irreversible confirmation, `Sheet` for side work that should preserve page
context, and `Drawer` for transient bottom-sheet-like work.

## Common Forks

Use `RadioGroup` instead of `Select` when the option count is small and seeing
all choices improves confidence.

Use `Select` instead of `Combobox` when the option set is known, short enough
to scan, and search would add unnecessary interaction.

Use `Combobox` when users must search, filter, or pick from a long list where
typing is faster than scanning.

Use `Checkbox` for independent choices. Use `Switch` only when toggling changes
the interface or setting immediately.

Use `Badge` for read-only state such as `Draft`, `Ready`, or `Failed`. Use
`Alert` when the message needs attention and explanation.

Use `Tabs` for peer views within the same context. Do not use tabs as filters
for one table or list; use filters, segmented controls, or form controls.

Use `DropdownMenu` for actions. Do not use it when the user is choosing a form
value; use `RadioGroup`, `Select`, `Combobox`, or `Checkbox` instead.

## Deep Components

Use these only when the task explicitly asks for their interaction model:

- `Command` for command palettes and searchable action menus.
- `ContextMenu` for right-click or object-local secondary actions.
- `Menubar` for application-style menu bars.
- `Resizable` for split panes users can adjust.
- `Kanban` for drag-and-drop board workflows.
- `Carousel` for ordered media browsing.
- `Calendar` for date picking or calendar views.
- `Sidebar` for durable navigation chrome.

Deep components are capability, not default context. If the requested artifact
can be solved with `Card`, `Table`, `Tabs`, `Select`, or simple form controls,
start there.

## Working Rule

Prefer native content before custom interaction, visible choices before hidden
menus, semantic status before decorative labels, stable layout before clever
disclosure, and local Canvas primitives before one-off markup.
