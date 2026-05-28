# Agent-HTML

[中文](./README.zh-CN.md)

Agent-HTML is an AI-native artifact workspace for turning generated HTML into
structured, editable, and previewable documents. It combines a block editor,
runtime preview, theme controls, and agent feedback loops so HTML output can be
reviewed and revised like a living artifact instead of a static answer.

![Edit HTML like Notion](./public/block-dnd.gif)

Edit HTML like Notion.

## What It Does

- Edit generated HTML through draggable blocks instead of raw source only.
- Preview structured artifacts such as Kanban boards, timelines, and responsive
  layout compositions.
- Tune presentation with built-in themes, custom themes, and aspect-ratio aware
  preview controls.
- Keep humans and agents in the same loop for review, feedback, and iteration.

## Preview

### Block Editing

Move generated UI as blocks, with drag handles and drop placement that make
artifact editing feel closer to a page builder than a static HTML preview.

![Block drag and drop](./public/block-dnd.gif)

### Structured Components

Agent-HTML is designed for artifact-shaped output: dashboards, boards, reports,
briefs, and other reviewable surfaces.

<table>
  <tr>
    <td width="50%">
      <strong>Kanban</strong><br />
      <img src="./public/components3-kanban.gif" alt="Kanban component artifact" />
    </td>
    <td width="50%">
      <strong>Charts</strong><br />
      <img src="./public/components2-chart.gif" alt="Chart components rendered from data" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>Image and table</strong><br />
      <img src="./public/components3-img%26table.gif" alt="Image and table component composition" />
    </td>
    <td width="50%">
    </td>
  </tr>
</table>

### Themes

Switch between built-in themes and keep the same underlying artifact structure.

![Theme switching](./public/theme.gif)

### Agent Collaboration

Review the artifact, point at what needs to change, and keep iteration close to
the preview.

![Interact with agent](./public/interact%20with%20agent.gif)

## Documents

- [Docs index](./docs/index.md): product, engineering, design, and reference
  documentation.

## Development

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

License terms vary by package. See the root [`LICENSE`](./LICENSE) and
package-level license files for details. Short version: check the folder you
use.

## Thanks To

- [shadcn/ui](https://shadcn-ui.com/) for the UI components.
- [linux.do](https://linux.do/) for community feedback and discussion.
