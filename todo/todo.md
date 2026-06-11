对，这个方向是对的。应该建立一个**语义 token / class 分层金字塔**。

核心判断：

```text
越底层：
  越基础
  越可组合
  越接近 design primitive
  语义弱
  使用者需要自己判断组合

越上层：
  越结构化
  越接近 artifact 范式
  语义强
  agent 需要想的更少
  但准入要更严格
```

可以这样画：

```text
                         ┌─────────────────────────────┐
                         │ L4 Pattern / Template        │
                         │ 高层范式                      │
                         │ "source section"             │
                         │ "media figure"               │
                         │ "metric panel"               │
                         └──────────────▲──────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │ L3 Semantic Content Classes  │
                         │ 内容语义                      │
                         │ canvas-text-note             │
                         │ canvas-surface-muted         │
                         │ canvas-meta-row              │
                         └──────────────▲──────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │ L2 Public Composition Classes│
                         │ 可组合内容类                  │
                         │ canvas-stack-sm              │
                         │ canvas-wrap-sm               │
                         │ canvas-text-caption          │
                         │ canvas-content-panel         │
                         └──────────────▲──────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │ L1 Theme Tokens              │
                         │ 基础语义 token                │
                         │ background / foreground      │
                         │ muted / border / primary     │
                         │ success / warning / info     │
                         └──────────────▲──────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │ L0 Raw Values                │
                         │ 原始值                        │
                         │ rem / oklch / px / radius    │
                         └─────────────────────────────┘
```

用你说的 `canvas-text-note` 来看，它确实比这个更强：

```text
canvas-text-caption text-muted-foreground
```

因为后者只是组合：

```text
caption size + muted color
```

而 `canvas-text-note` 直接表达用途：

```text
这是辅助说明 / 注释 / 低优先级解释文本
```

也就是：

```text
L2:
  canvas-text-caption + text-muted-foreground

L3:
  canvas-text-note
```

这很适合 agent 减负。agent 不再需要想：

```text
这是 caption 吗？
要不要 muted？
用 text-muted-foreground 还是 opacity？
```

它只要判断：

```text
这是 note
```

然后用：

```tsx
<p className="canvas-text-note">
```

但上层语义 class 有一个风险：**名字一旦不准，会误导更多 agent**。

所以我建议准入规则是：

```text
L3 semantic class 只有在满足这些条件时才加：

1. 高频出现
2. 组合稳定
3. 语义稳定
4. 不绑定某个 artifact 主题
5. 替换后不会隐藏关键布局差异
6. 名字能被 agent 一眼理解
```

例如：

```text
Good L3 candidates:
  canvas-text-note
  canvas-text-kicker
  canvas-surface-muted
  canvas-surface-panel
  canvas-meta-row

Weak candidates:
  canvas-pretty-row
  canvas-soft-thing
  canvas-cardish
  canvas-inline-center
```

其中 `canvas-inline-center` 就比较危险，因为它只是布局动作，不是内容语义。它应该留在 L2：

```tsx
<div className="canvas-wrap-sm items-center">
```

而 `canvas-text-note` 可以上升到 L3，因为它是内容角色。

我会把这个系统定义成：

```text
L1 token:
  颜色、半径、间距、字体值

L2 utility class:
  可组合的排版/布局/内容基础

L3 semantic class:
  artifact 高频语义角色

L4 component/pattern:
  结构完整、有数据形状、有交互或复合 DOM
```

对应例子：

```text
L1:
  --muted-foreground
  --canvas-content-caption-font-size

L2:
  canvas-text-caption
  text-muted-foreground

L3:
  canvas-text-note

L4:
  SourceLinks
  MediaFigure
```

这样就能避免两个极端：

```text
太底层：
  agent 每次都手拼 class，注意力重

太上层：
  什么都抽成组件，系统变笨重
```

比较健康的是：

```text
Raw token -> public class -> semantic role -> component
```

不是所有重复都直接进组件。很多重复应该停在 L3 semantic class。