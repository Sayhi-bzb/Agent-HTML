# Agent-HTML

[中文](./README.zh-CN.md)

Markdown is great for prose, lists, and code. But many agent outputs need more than a document can carry: dashboards, data views, visual comparisons, workflows, product mockups, themed reports, and interfaces that invite review instead of just reading.

Agent-HTML gives those outputs an HTML-shaped home. It turns agent work into durable React artifacts that can show structure, carry interaction, use local data, apply themes, expose inspectable regions, and stay editable after the chat moves on.

![Canvas artifact preview](./public/block-dnd.gif)

## Beyond Markdown

Markdown can explain an idea. HTML can make the idea visible, spatial, styled, stateful, and interactive.

That difference matters when an agent is not just writing text, but making something a human needs to scan, compare, filter, inspect, present, or revise. A roadmap needs lanes. A report needs hierarchy. A dataset needs tables and charts. A product concept needs layout. A workflow needs controls. A review needs a target.

Agent-HTML is for that richer expression layer: the point where an answer should become a surface.

## How Canvas Works

- `agent-html` is the portable source workspace where agents write React and TypeScript artifacts.
- `@agent-html/react` provides the headless `Artifact` and `Block` protocol so rich HTML surfaces have stable, addressable regions.
- The Canvas host discovers artifacts, renders them through Vite, shows guard feedback, overlays block inspection controls, routes block prompts, and applies theme presets.
- Local Canvas resources keep the expression system coherent: UI primitives, hooks, helpers, schemas, fixtures, assets, semantic CSS classes, examples, and source rules live beside the artifacts that use them.

## Canvas Preview

### Inspectable Rich Surfaces

Rich artifacts need focused review. `Block` metadata lets the host target one visible region, place prompt actions, and pass compact context back into the agent workflow without exposing host privileges to artifact source.

![Artifact block inspection](./public/block-dnd.gif)

### More Than Text Output

Use Agent-HTML when the output wants layout, visual density, state, or interaction: operational dashboards, Kanban boards, data reports, briefs, charts, tables, comparison views, and focused internal tools.

<table>
  <tr>
    <td width="50%">
      <strong>Kanban</strong><br />
      <img src="./public/components3-kanban.gif" alt="Kanban artifact example" />
    </td>
    <td width="50%">
      <strong>Charts</strong><br />
      <img src="./public/components2-chart.gif" alt="Chart artifact example" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>Image and table</strong><br />
      <img src="./public/components3-img%26table.gif" alt="Image and table artifact example" />
    </td>
    <td width="50%">
    </td>
  </tr>
</table>

### Presentation Is Part of the Artifact

Themes, spacing, typography, and surface treatment shape how a rich artifact is understood. The host can apply theme presets while artifact source stays on semantic tokens and Canvas classes.

![Theme presets](./public/theme.gif)

### Revision Stays Close to the Surface

Canvas prompt routing uses artifact metadata, block ids, optional implementation files, and compact interaction state so follow-up prompts can stay close to the part of the HTML surface that actually needs work.

![Block prompt flow](./public/interact%20with%20agent.gif)

## Built for Agent Workflows

- Durable context: rules, resources, examples, data, and artifacts live in the filesystem instead of disappearing into chat state.
- Rich expression: artifacts can combine text, data, layout, media, controls, charts, and themed presentation.
- Focused revision: blocks give agents and humans stable handles for targeted feedback.
- Local reuse: Canvas makes the nearest correct primitive, hook, helper, schema, fixture, or asset easier to find.
- Guarded boundaries: artifact source stays separate from host internals, old runtime surfaces, generated bundles, and privileged APIs.

## Quick Start

Install the npm package:

```bash
npm install agent-html
```

Create a local Canvas workspace:

```bash
npx agent-html init
```

Start the Canvas host:

```bash
npx agent-html dev
```

Then ask your agent to build or revise a React artifact in `agent-html/artifacts`:

```text
Build a dashboard artifact in agent-html/artifacts using Agent-HTML Canvas.
Read agent-html/README.md and agent-html/AGENTS.md first.
```

## Documentation

- [Canvas docs](./apps/docs/content/docs/index.mdx): current Canvas constitution, architecture, workspace, host, design-system, and reference docs.
- [Canvas workspace](./agent-html/README.md): cold-start route for authoring artifacts and using local Canvas resources.
- [Agent instructions](./AGENTS.md): repository operating rules and content routes.
- [Taste](./taste/README.md): repo-level judgment systems.
- [Agent Ergonomics](./taste/agent-ergonomics/README.md): AE, context routes, and route checks for agent-facing workspace ergonomics.

Historical App and Runtime material lives under `_archive` for reference only.

## Development

Start the Canvas dev host:

```bash
npm run dev
```

Useful checks:

```bash
npm run test
npm run typecheck
npm run lint
```

## License

License terms vary by package. See the root [`LICENSE`](./LICENSE) and package-level license files for details. Short version: check the folder you use.

## Thanks To

- [shadcn/ui](https://shadcn-ui.com/) for the UI components.
- [linux.do](https://linux.do/) for community feedback and discussion.
