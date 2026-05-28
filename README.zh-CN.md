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

### 块编辑

把生成的 UI 当作块来移动，通过拖拽把手和落点预览，让工件编辑更接近页面搭建，
而不是静态 HTML 预览。

![块拖拽](./public/block-dnd.gif)

### 结构化组件

Agent-HTML 面向工件形态的输出：仪表盘、看板、报告、简报，以及其他适合审阅的
界面。

<table>
  <tr>
    <td width="50%">
      <strong>Kanban</strong><br />
      <img src="./public/components3-kanban.gif" alt="Kanban 看板组件工件" />
    </td>
    <td width="50%">
      <strong>图表</strong><br />
      <img src="./public/components2-chart.gif" alt="由数据渲染的图表组件" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>图片和表格</strong><br />
      <img src="./public/components3-img%26table.gif" alt="图片和表格组件组合" />
    </td>
    <td width="50%">
    </td>
  </tr>
</table>

### 主题

在内置主题之间切换，同时保持同一套底层工件结构。

![主题切换](./public/theme.gif)

### Agent 协作

审阅工件，指出需要修改的位置，并让下一轮迭代紧贴预览结果发生。

![与 agent 交互](./public/interact%20with%20agent.gif)

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

## 许可证

不同目录授权不同，请以根目录 [`LICENSE`](./LICENSE) 和各 package/目录内的
授权声明为准。简单说：用哪个目录，就看哪个目录的声明。

## 致谢

- [shadcn/ui](https://shadcn-ui.com/) 提供 UI 组件。
- [linux.do](https://linux.do/) 提供社区反馈和讨论。
