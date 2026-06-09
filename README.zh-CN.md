# Agent-HTML

[English](./README.md)

Markdown 很适合承载文字、列表和代码。但很多 agent 输出需要的不只是文档：仪表盘、数据视图、视觉对比、工作流、产品 mockup、主题化报告，以及那些需要被审阅而不只是被阅读的界面。

Agent-HTML 给这些输出一个 HTML 形态的承载空间。它把 agent 工作变成持久的 React artifacts，让内容可以呈现结构、携带交互、使用本地数据、应用主题、暴露可检查区域，并在对话结束后继续编辑。

![Canvas artifact 预览](./public/block-dnd.gif)

## 不止 Markdown

Markdown 可以解释一个想法。HTML 可以让这个想法变得可见、有空间结构、有样式、有状态，并且可以交互。

当 agent 不只是写文字，而是在生成需要人扫描、比较、筛选、检查、展示或修订的东西时，这个差异会变得很重要。Roadmap 需要泳道，报告需要层级，数据集需要表格和图表，产品概念需要布局，工作流需要控件，审阅需要目标。

Agent-HTML 面向的就是这一层更丰富的表达：当一个回答应该变成一个界面。

## Canvas 如何工作

- `agent-html` 是可移植源码工作区，agent 在这里编写 React 和 TypeScript artifacts。
- `@agent-html/react` 提供 headless `Artifact` 和 `Block` protocol，让丰富的 HTML surface 拥有稳定、可寻址的区域。
- Canvas host 发现 artifacts，通过 Vite 渲染，显示 guard 反馈，叠加 block 检查控件，路由 block prompts，并应用 theme presets。
- 本地 Canvas 资源让表达系统保持一致：UI primitives、hooks、helpers、schemas、fixtures、assets、semantic CSS classes、examples 和源码规则都与使用它们的 artifacts 放在一起。

## Canvas 预览

### 可检查的丰富界面

丰富的 artifact 需要聚焦审阅。`Block` metadata 让 host 可以定位一个可见区域、放置 prompt actions，并把压缩后的上下文传回 agent 工作流，同时不向 artifact source 暴露 host 特权能力。

![Artifact block 检查](./public/block-dnd.gif)

### 不只是文本输出

当输出需要布局、视觉密度、状态或交互时，使用 Agent-HTML：运营仪表盘、Kanban、数据报告、简报、图表、表格、对比视图和聚焦的内部工具。

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

### 呈现也是 Artifact 的一部分

主题、间距、排版和界面处理方式会影响一个丰富 artifact 如何被理解。Host 可以应用 theme presets，而 artifact source 继续使用 semantic tokens 和 Canvas classes。

![主题 presets](./public/theme.gif)

### 修订贴近界面本身

Canvas prompt routing 使用 artifact metadata、block ids、可选 implementation files 和压缩后的 interaction state，让后续 prompt 贴近真正需要修改的 HTML surface。

![Block prompt flow](./public/interact%20with%20agent.gif)

## 为 Agent 工作流设计

- 持久上下文：rules、resources、examples、data 和 artifacts 位于文件系统，而不是消失在聊天状态里。
- 丰富表达：artifacts 可以组合文本、数据、布局、媒体、控件、图表和主题化呈现。
- 聚焦修订：blocks 给 agent 和人提供稳定的反馈定位点。
- 本地复用：Canvas 让最近的正确 primitive、hook、helper、schema、fixture 或 asset 更容易被找到。
- 边界保护：artifact source 与 host internals、old runtime surfaces、generated bundles 和 privileged APIs 保持分离。

## 快速开始

安装 npm 包：

```bash
npm install agent-html
```

创建本地 Canvas 工作区：

```bash
npx agent-html init
```

启动 Canvas host：

```bash
npx agent-html dev
```

然后让你的 agent 在 `agent-html/artifacts` 里创建或修改 React artifact：

```text
使用 Agent-HTML Canvas 在 agent-html/artifacts 里创建一个 dashboard artifact。
请先阅读 agent-html/README.md 和 agent-html/AGENTS.md。
```

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
