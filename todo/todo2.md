 当前离开释放分三类：

 - Sankey：节点/link 自己有 onMouseLeave，container 也有 onMouseLeave 兜底，所以释放比较完整。
 - Line / Area：整个 SVG 都是交互面，移动到图内任意位置都会重新选 nearest datum，只在离开 SVG 时释放，这
   是合理的。

为离散图表的 hit layer 增加 mark-level leave 清理：Bar、BarH、Pie 在离开具体柱形/扇区时立即释放
hover、tooltip 和 tooltip point；SVG/container leave 继续作为兜底。Line/Area 不改，因为它们是整图
nearest-datum 交互模型。

- 在 Bar / BarH 中复用一个 hideTooltip 处理器：
    - setHover(null)
    - setTooltip(null)
    - clearTooltipPoint()
    - 传给每个 ChartHitRect.onPointerLeave

- 在 Pie 中复用同样的 hideTooltip：
    - 传给每个 ChartHitPath.onPointerLeave