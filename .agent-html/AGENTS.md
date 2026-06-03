# AgentHTML React Canvas

Write normal React artifacts in `.agent-html/artifacts/*.agent.tsx`.

## Design contract

React Canvas uses the same design-system direction as the app, but it does not
import the app implementation:

```text
.agent-html/styles.css
  -> .agent-html/ui primitives
  -> host and artifact composition
```

- `.agent-html/styles.css` is the token and theme entrypoint.
- `.agent-html/ui` is the only primitive layer for React Canvas.
- Host and artifacts compose primitives; they do not create new primitive
  buttons, cards, badges, tables, sidebars, or inputs.
- `Artifact`, `Block`, and `Action` from `@agent-html/react` are headless
  collaboration protocol markers, not visual components. They provide metadata,
  host anchors, source extraction anchors, action dispatch, accessibility, and
  props passthrough. Put layout and visual treatment in artifact composition and
  `.agent-html/ui` primitives.
- Use semantic token utilities such as `bg-background`, `text-foreground`,
  `bg-card`, `text-muted-foreground`, `border-border`, `bg-popover`, and
  `text-popover-foreground`.
- Do not use raw colors, decorative gradients, oversized shadows, or marketing
  hero composition.
- Keep surfaces compact, neutral, task-oriented, accessible, and predictable.
- Use cards only for real modules, objects, list items, placeholders, or
  disclosures. Avoid card-inside-card unless the inner surface has independent
  object identity or interaction scope.
- Treat the sidebar as a first-class component family. Use sidebar primitives
  and `sidebar*` tokens for sidebar chrome only.
- Treat prompt UI as a disclosure surface. Floating panels use `popover` tokens,
  not sidebar tokens.
- Text, code, generated output, and data values should stay selectable. Chrome,
  navigation rows, badges, and block action controls may disable accidental
  selection through primitives.

Rules:

- Import `Artifact`, `Block`, and `Action` from `@agent-html/react`.
- Use `Artifact` as the top-level wrapper.
- Wrap every major semantic region in `Block`.
- Use stable, unique, readable, kebab-case block ids.
- Prefer local `../ui`, `../hooks`, `../lib`, `../schema`, and `../data`
  imports before hand-writing common UI or utility code.
- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or
  privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`,
  `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.
