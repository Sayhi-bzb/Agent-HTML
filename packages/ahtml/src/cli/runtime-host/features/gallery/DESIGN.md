# Gallery Token Philosophy

`gallery` 不是独立产品壳，也不是一组互不相关的 demo 页面。
它是 `artifactProfile` 的样式工作台，用来让主题 token、typography、radius 和 layout 在多个 preview 中被同一套语言消费。

这份文档定义 `packages/ahtml/src/cli/runtime-host/features/gallery` 的 CSS token 化哲学。
后续新增 preview、重构样式、补充 token 编辑能力时，都应以这里为准。

## 1. Token 分层

`gallery` 的 token 体系固定为三层：

- `artifact theme token`：来自 `draftProfile.globalStyle`，包括 `tokenSets.light/dark`、typography、`radiusScale`、shadow 等用户可编辑契约。
- `primitive scale`：提供离散基础尺度，当前以 `--ahtml-space-*`、surface padding、layout gap、radius base 为主。
- `semantic gallery token`：把基础尺度映射成 workbench / preview 语义，例如 `--ahtml-gallery-layout-gap`、`--ahtml-gallery-layout-gap-compact`、`--ahtml-gallery-layout-inline-padding`、`--ahtml-gallery-content-card-padding`。

页面、组件、preview CSS 必须优先消费后两层，不应在具体 preview 里散落新的近似裸值。

## 2. 当前真值

当前 `gallery` 代码已经形成了几组真实 token 家族：

- theme token：`background`、`foreground`、`primary`、`muted`、`border`、`ring`、`chart*`、`sidebar*`
- spacing token：`--ahtml-space-2xs/xs/sm/md/lg`
- layout token：`--ahtml-gallery-layout-gap`、`--ahtml-gallery-layout-gap-compact`、`--ahtml-gallery-layout-gap-relaxed`
- inset / panel token：`--ahtml-gallery-layout-inline-padding`、`--ahtml-gallery-layout-block-padding`、`--ahtml-gallery-content-card-padding`、`--ahtml-gallery-content-card-padding-relaxed`、`--ahtml-gallery-compact-panel-padding-*`
- size token：`--ahtml-gallery-control-size*`、`--ahtml-gallery-pill-min-height`、`--ahtml-gallery-swatch-size-*`
- layout singleton token：`--ahtml-gallery-dashboard-sidebar-width`、`--ahtml-gallery-nav-item-min-height`、`--ahtml-gallery-leading-detail-columns`、`--ahtml-gallery-mail-shell-columns`

`styles.ts` 聚合 `base/cards/colors/custom/dashboard/mail/pricing/responsive/typography`，这些文件必须共享同一套 token 语言，而不是各自生长一套局部 spacing 习惯。

## 3. 哪些维度应该 scale 化

`gallery` 中优先进入 scale 的维度：

- `space`：通用间距、stack rhythm、compact / relaxed gap
- `padding`：content card、layout inset、compact panel inset
- `size`：control 高度、pill 最小高度、swatch / trigger 等跨 preview 重复尺寸
- `text`：正文、辅助文案、kicker 的字号层级
- `leading`：正文和说明文案的行高层级
- `radius`：通过 `radiusScale` 统一 card、input、popover、preview shell 的圆角基线

处理原则：

- 新 spacing / padding / size / text / line-height 需求必须优先映射到最近的既有 scale。
- 当多个 preview 需要相同的节奏时，应新增共享 scale 或共享 semantic token，而不是分别写新值。
- `dashboard`、`mail`、`pricing`、`cards`、`custom` 的 preview 不应各自维护仅差一点点的 spacing 数值。

## 4. 哪些维度保持语义化

以下维度不应被压成裸 scale：

- `color`：继续保持 artifact theme token 语义，不把 preview 颜色退化成局部 hex / rgb 常量
- `tracking`：只保留少量语义角色，不为近似文案场景分裂多套 token
- `columns / widths / breakpoints`：如 sidebar width、mail shell columns、comparison columns，这些是布局单例约束，应保持语义 token
- `surface emphasis`：阴影、surface mix、特殊边框对比等继续围绕语义角色，而不是扩成一组无差别数值

一句话约束：

- `color` 解决语义和主题同步。
- `scale` 解决密度和节奏统一。
- `layout singleton` 解决具体 preview 的结构边界。

## 5. 诚实化规则

token 只在它有接口价值时保留。

- 纯直通、单点使用、没有语义增量的 alias token，不应长期存在。
- `gap` 负责元素之间的节奏，`padding` 负责容器内边距，不应用 `gap` 伪装 inset。
- preview 局部如果只是把 `--ahtml-space-sm` 改名再转发一次，但没有跨 preview 复用价值，应回收到上游 scale。
- 若一个值承担了稳定的 preview 角色，例如 `--ahtml-gallery-layout-gap-compact` 或 `--ahtml-gallery-dashboard-sidebar-width`，则应保留为语义 token。

允许保留的 token：

- 用户可编辑 theme 契约
- 跨多个 preview 复用的 spacing / inset / layout token
- 明确的 preview 结构单例

应优先删除或回收的 token：

- 纯转写 primitive 的一次性别名
- 只在单个 selector 使用、且不表达稳定语义的局部 token
- 与现有 token 数值近似但没有独立角色的新 token

## 6. Gallery 专用约束

`gallery` 的核心不是“把每个 preview 做得不一样”，而是“让不同 preview 证明同一套 token 契约是成立的”。

- preview artifact 可以有主题差异，但 layout rhythm 应尽量来自共享 gallery token。
- controls、preview、colors 面板虽然职责不同，仍应共享基础 space / inset 语言。
- 用户编辑的是 `artifactProfile` 的 token 契约，不是预览内部的碎片化 magic number。
- 当 preview 需要更强个性时，优先通过 theme token、layout singleton、semantic gallery token 组合完成，不直接写散落常量。

## 7. 实施口径

后续在 `gallery` 写样式时，按这个顺序决策：

1. 先判断需求属于 theme token、primitive scale，还是 semantic gallery token。
2. 如果现有 token 能表达，就直接复用，不新增近似值。
3. 如果现有 token 不够，先补共享语义 token，再考虑 preview 局部 token。
4. 只有当某个值承担稳定结构角色时，才允许保留为 preview singleton。

`gallery` 的 token 哲学与仓内 app shell 的治理原则一致：先统一 scale，再建立语义映射，最后让消费层只消费 contract。
不同的是，`gallery` 的第一优先级不是 app shell，而是 `artifactProfile` 和多 preview 共享样式语言。
