# Agent-HTML

[English](./README.md)

Agent-HTML 是一个面向 AI 原生工件的工作区，用来把生成的 HTML 转成结构化、
可编辑、可预览的文档。它把块编辑器、运行时预览、主题控制和 agent 反馈流程
放在一起，让 HTML 输出可以像一个持续演进的工件一样被审阅和修改，而不是停留
在一段静态回答里。

![像 Notion 一样编辑 HTML](./public/block-dnd.gif)

像 Notion 一样编辑 HTML。

## 能做什么

- 通过可拖拽的块编辑生成的 HTML，而不是只能编辑原始源码。
- 预览 Kanban、时间线、响应式布局组合等结构化工件。
- 使用内置主题、自定义主题和宽高比预览控制来调整展示效果。
- 让人和 agent 留在同一个审阅、反馈、迭代循环里。

## 预览

### 结构化工件

Agent-HTML 面向工件形态的输出：计划、看板、时间线、报告、简报，以及其他
适合审阅的界面。

<table>
  <tr>
    <td width="50%">
      <strong>Kanban</strong><br />
      <img src="./public/kanban.png" alt="Kanban 看板工件" />
    </td>
    <td width="50%">
      <strong>Timeline</strong><br />
      <img src="./public/timeline.png" alt="时间线工件" />
    </td>
  </tr>
</table>

### 响应式预览

通过宽高比预览控制，检查同一个工件在不同展示格式下是否依然清晰可靠。

![宽高比预览](./public/aspectratio.png)

### 主题

在内置主题之间切换，或为同一套工件结构定义自定义视觉风格。

<table>
  <tr>
    <td width="50%">
      <strong>主题一</strong><br />
      <img src="./public/theme1.png" alt="主题一" />
    </td>
    <td width="50%">
      <strong>主题二</strong><br />
      <img src="./public/theme2.png" alt="主题二" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>自定义主题</strong><br />
      <img src="./public/custom%20theme.png" alt="自定义主题" />
    </td>
    <td width="50%">
    </td>
  </tr>
</table>

### Agent 协作

审阅工件，指出需要修改的位置，并让下一轮迭代紧贴预览结果发生。

![与 agent 交互](./public/interact%20with%20agent.png)

## 文档

- [文档索引](./docs/index.md)：产品、工程、设计和参考文档。

## 开发

```bash
npm run dev
```

常用检查：

```bash
npm run test
npm run typecheck
npm run lint
```

## 致谢

- [shadcn/ui](https://shadcn-ui.com/) 提供 UI 组件。
- [linux.do](https://linux.do/) 提供社区反馈和讨论。
