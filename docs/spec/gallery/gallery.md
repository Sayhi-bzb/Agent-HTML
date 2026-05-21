# Gallery Product Standard

`ahtml gallery` 是 configuration layer 的可视化入口页。  
它服务于 artifact profile 的选择、编辑、保存与预览，不承担语义 authoring，不替代 runtime host，也不改变 core/schema contract。

本页把 low-fidelity 线框提升为 gallery 的当前产品标准。  
若 blueprint、docs-web、CLI 文案或运行时界面与本文冲突，以本文为 gallery 产品定义基线。

```txt
╭header────────────────────────────────────────────────────────────────────────╮
│agent-html                                                        <github>icon│
├────────────────────┬─────────────────────────────────────────────────────────┤
│<profile-ref>Combobox│        <reset>icon <theme>icon <save>icon <preview>icon│
├────────────────────┼─────────────────────────────────────────────────────────┤
│                    │╭component────────────╮  ╭component────────────────────╮ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    ││                     │  │                             │ │
│                    │╰─────────────────────╯  ╰─────────────────────────────╯ │
│                    │╭component───╮  ╭component───────────────────╮           │
│                    ││            │  │                            │           │
│                    ││            │  │                            │           │
│                    ││            │  │                            │           │
│                    ││            │  │                            │           │
│                    ││            │  ╰────────────────────────────╯           │
│                    ││            │   ╭component──────────╮   ╭component──────│
│                    ││            │   │                   │   │               │
│                    ││            │   │                   │   │               │
│                    ││            │   │                   │   │               │
│                    ││            │   │                   │   │               │
│                    │╰────────────╯   ╰───────────────────╯   ╰───────────────│
╰────────────────────┴─────────────────────────────────────────────────────────╯
```

## Product Goal

- 把 `artifactProfileReference` 和 `artifactProfile` 的管理变成可见、可编辑、可保存的配置流程。
- 让用户在一个页面里观察 typography、tokens、radius、component treatments 对组件家族的影响。
- 为 `preview` / `build` 在文档未显式设置 `profile-ref` 时提供默认 artifact profile 选择入口。

## Non-goals

- 不把 gallery 定义成语义文档编辑器。
- 不在 gallery 中暴露 schema、sanitize 或 runtime host 的内部实现参数。
- 不让 gallery 成为新的公开协议入口；现有 `artifactProfileReference` / `artifactProfile` 与 gallery endpoints 继续作为唯一状态模型。

## Primary Objects

- `artifactProfileReference`
  - 当前 artifact profile id。
  - 支持 select / create / delete。
- `artifactProfile`
  - 当前 draft 与 persisted 配置对象。
  - 支持 edit / reset / save。
- `globalStyle`
  - 当前稳定编辑面包含 typography、radius、light/dark token sets。
- `globalLayout`
  - 当前稳定配置模型中正式存在，但本页不要求同步提供独立 layout 编辑器。
- `componentStyle`
  - 当前稳定配置模型中保留为空对象，不提供独立编辑面。
- `componentLayout`
  - 当前稳定配置模型中正式存在，由 renderer projection 消费。

## Information Architecture

### Header

- 独立顶栏。
- 左侧保留产品标识。
- 右侧可承载仓库或文档跳转，不定义新的产品状态。

### Main Body

- 采用左右分栏。
- 左侧是配置器，不是空白占位区。
- 右侧是组件画廊，不是以长篇语义文档阅读流为主的 preview。

### Left Sidebar

- 顶部展示当前 `artifactProfileReference` 的选择与管理。
- 中部展示 `artifactProfile` 的稳定编辑分区：
  - Typography
  - Radius
  - Light Tokens
  - Dark Tokens
- 底部展示 persist actions 与状态反馈。

### Right Gallery Container

- 顶部是操作条与画廊说明。
- 主体是组件展柜。
- 组件展柜应以 grid / card matrix 的方式组织，而不是把所有组件缝成一条连续文档。
- 可按组件家族分区展示，例如 feedback、content、forms、selection、disclosure。

## Product Actions

正式支持的动作是：

- `select artifactProfileReference`
- `create artifactProfileReference`
- `delete artifactProfileReference`
- `edit artifactProfile draft`
- `reset draft to persisted state`
- `save artifactProfile`

说明：

- 线框中的 `theme` / `preview` 图标不直接定义为独立状态模型。
- 若未来保留这些图标，它们只能映射到已有 gallery 状态，不新增并行配置协议。

## Preview Model

- 右侧 preview 的正式定义是“组件展柜 + 配置器”。
- 组件画廊是主视图。
- 可包含少量文档式内容作为语义样例，但不得让“连续语义文档预览”重新成为主体验。
- 每个组件卡片应尽量让当前 artifact profile 的变化一眼可见。

## Contract Alignment

- `ahtml gallery` 继续作为唯一命令入口。
- 继续使用现有 gallery endpoints：
  - `/__ahtml/gallery/state`
  - `/__ahtml/gallery/select`
  - `/__ahtml/gallery/create`
  - `/__ahtml/gallery/save`
  - `/__ahtml/gallery/delete`
- 本标准只收敛产品定义，不改变现有 CLI contract、storage contract 或 core type surface。

## Current Alignment Requirement

为与本标准对齐，现有 gallery 需要满足：

- 左侧明确呈现配置器分区，而不是单纯 profile id 选择器。
- 右侧默认首屏是组件画廊。
- preview 文案改为强调 component gallery，而不是 continuous semantic preview。
- gallery 相关帮助文本、docs-web 文案、blueprint 中的 gallery 描述需要与本文口径一致。
