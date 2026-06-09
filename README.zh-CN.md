# Agent-HTML

[English](./README.md)

Agent-HTML 是面向 agent 编写 React artifact 的 Canvas 工作区。它为 agent 提供持久的文件系统上下文，用本地 UI primitives、数据、资产、示例和源码规则来组合、预览、校验和持续修订 artifact。

Canvas artifact 位于 `agent-html`，通过本地开发 host 渲染，并通过可检查的 `Artifact` 和 `Block` 边界让人和 agent 能够审阅具体区域、路由 block prompt，并把迭代保持在源码文件上。

![Canvas artifact 预览](./public/block-dnd.gif)

## 提供什么

- 一个可移植的 `agent-html` 源码工作区，用于 React 和 TypeScript artifact。
- 本地 Canvas 资源：UI primitives、hooks、helpers、schemas、fixtures、语义 CSS classes、主题 presets、assets 和 examples。
- 基于 Vite 的 Canvas host，用于 artifact 发现、预览、guard 反馈、block overlay、prompt 路由和主题应用。
- 来自 `@agent-html/react` 的 headless protocol：`Artifact` 和 `Block` 标记协作边界，但不拥有 artifact 布局。

## Canvas 预览

### Artifact Blocks

Canvas 通过稳定的 block metadata 让 artifact 区域可寻址。Host 可以检查 block、放置 prompt action、路由修订上下文，同时不向 artifact source 暴露特权 host 能力。

![Artifact block 检查](./public/block-dnd.gif)

### Artifact Examples

Artifact 可以用本地 Canvas 资源组合仪表盘、看板、报告、简报、图表、表格和其他适合审阅的界面。

<table>
  <tr>
    <td width="50%">
      <strong>Kanban</strong><br />
      <img src="./public/components3-kanban.gif" alt="Kanban artifact 示例" />
    </td>
    <td width="50%">
      <strong>图表</strong><br />
      <img src="./public/components2-chart.gif" alt="图表 artifact 示例" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>图片和表格</strong><br />
      <img src="./public/components3-img%26table.gif" alt="图片和表格 artifact 示例" />
    </td>
    <td width="50%">
    </td>
  </tr>
</table>

### 主题 Presets

Canvas host 应用主题 presets；artifact source 继续消费语义 tokens 和本地 Canvas classes。

![主题 presets](./public/theme.gif)

### Block Prompt Flow

Host 观察 artifact metadata 和 interaction state，让 prompt 可以定位正确的 artifact entry、block id、可选 implementation file，以及压缩后的 interaction snapshot。

![Block prompt flow](./public/interact%20with%20agent.gif)

## 文档

- [Canvas docs](./apps/docs/content/docs/canvas/index.mdx)：当前 Canvas constitution、architecture、workspace、host、design-system 和 reference docs。
- [Canvas workspace](./agent-html/README.md)：编写 artifact 和使用本地 Canvas 资源的冷启动路线。
- [Agent 指令](./AGENTS.md)：仓库操作规则和内容路线。
- [Taste](./taste/README.md)：仓库级判断系统。
- [Agent Ergonomics](./taste/agent-ergonomics/README.md)：AE、context route 和面向 agent 工作区人体工学的 route checks。

历史 App 和 Runtime 材料位于 `_archive`，仅作参考。

## 开发

启动 Canvas dev host：

```bash
npm run dev
```

常用检查：

```bash
npm run test
npm run typecheck
npm run lint
```

## 许可证

不同目录授权不同，请以根目录 [`LICENSE`](./LICENSE) 和各 package/目录内的授权声明为准。简单说：用哪个目录，就看哪个目录的声明。

## 致谢

- [shadcn/ui](https://shadcn-ui.com/) 提供 UI 组件。
- [linux.do](https://linux.do/) 提供社区反馈和讨论。
