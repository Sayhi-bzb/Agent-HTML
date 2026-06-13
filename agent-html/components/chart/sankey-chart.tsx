"use client";

import { sankey, sankeyCenter, sankeyLinkHorizontal } from "@visx/sankey";
import type {
  SankeyGraph,
  SankeyLink as SankeyLinkType,
  SankeyNode as SankeyNodeType,
} from "d3-sankey";
import {
  memo,
  type ReactNode,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";
import {
  type ChartConfig,
  type ChartHoverState,
  type ChartMaterialRegistry,
  type ChartRoughOptions,
  ChartContainer,
  ChartInteractionRoot,
  ChartMotionGroup,
  ChartMotionText,
  ChartSvg,
  ChartTooltip,
  ChartTooltipPanel,
  type ChartRenderer,
  chartHoverOpacity,
  chartMotion,
  getChartMarkKey,
  resolveChartRenderer,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime";
import { ChartRenderedPath } from "./runtime";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SankeyNodeDatum {
  name: string;
  category?: "source" | "landing" | "outcome";
  [key: string]: unknown;
}

interface SankeyLinkDatum {
  source: number;
  target: number;
  value: number;
  [key: string]: unknown;
}

export interface SankeyData {
  nodes: SankeyNodeDatum[];
  links: SankeyLinkDatum[];
}

interface SankeyChartLayout {
  aspectRatio?: string;
  margin?: Partial<Margin>;
  nodePadding?: number;
  nodeRadius?: number;
  nodeWidth?: number;
}

interface SankeyTooltipData {
  type: "node" | "link";
  nodeIndex?: number;
  linkIndex?: number;
}

type SankeyHoverState = ChartHoverState<"node" | "link">;

export interface SankeyChartProps {
  className?: string;
  config?: ChartConfig;
  data: SankeyData;
  getLinkColorKey?: (
    link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  getNodeColorKey?: (
    node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  layout?: SankeyChartLayout;
  renderLinkTooltip?: (props: {
    link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => ReactNode;
  renderNodeTooltip?: (props: {
    node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => ReactNode;
  renderer?: ChartRenderer;
  rough?: ChartRoughOptions;
  strokeOpacity?: number;
}

interface SankeyChartCoreProps {
  data: SankeyData;
  getLinkColorKey?: SankeyChartProps["getLinkColorKey"];
  getMaterial: ChartMaterialRegistry["getMaterial"];
  getNodeColorKey?: SankeyChartProps["getNodeColorKey"];
  margin: Margin;
  nodePadding: number;
  nodeRadius: number;
  nodeWidth: number;
  renderLinkTooltip?: SankeyChartProps["renderLinkTooltip"];
  renderNodeTooltip?: SankeyChartProps["renderNodeTooltip"];
  renderer: ChartRenderer;
  rough?: ChartRoughOptions;
  strokeOpacity: number;
  width: number;
  height: number;
}

type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;
type SankeyMarkInteraction = ReturnType<
  typeof useChartMarkInteraction<SankeyTooltipData, "node" | "link">
>;

const DEFAULT_MARGIN: Margin = { top: 40, right: 180, bottom: 40, left: 180 };
const DEFAULT_SANKEY_CONFIG = {
  landing: {
    color: "var(--chart-2)",
  },
  link: {
    color: "var(--chart-line-primary)",
  },
  outcome: {
    color: "var(--chart-3)",
  },
  source: {
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;
const intFmt = new Intl.NumberFormat("en-US").format;

function getSankeyLinkKey(index: number) {
  return getChartMarkKey("link", index);
}

function getSankeyNodeKey(index: number) {
  return getChartMarkKey("node", index);
}

function getDefaultSankeyLinkColorKey() {
  return "link";
}

function getDefaultSankeyNodeColorKey(
  node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>
) {
  return node.category ?? "source";
}

function getNodeIndex(nodeOrIndex: NodeOrIndex): number | undefined {
  if (typeof nodeOrIndex === "number") {
    return nodeOrIndex;
  }
  return nodeOrIndex.index;
}

function getNodeObject(
  nodeOrIndex: NodeOrIndex
): SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | null {
  if (typeof nodeOrIndex === "number") {
    return null;
  }
  return nodeOrIndex;
}

function getNodeDisplayValue(
  node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
  nodeIndex: number,
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[]
) {
  let displayValue = 0;

  for (const link of links) {
    const sourceIndex = getNodeIndex(link.source as NodeOrIndex);
    const targetIndex = getNodeIndex(link.target as NodeOrIndex);
    if (node.category === "source" && sourceIndex === nodeIndex) {
      displayValue += link.value;
    } else if (node.category !== "source" && targetIndex === nodeIndex) {
      displayValue += link.value;
    }
  }

  return displayValue;
}

function createSankeyPath(
  link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>
) {
  try {
    const pathGenerator = sankeyLinkHorizontal();
    return pathGenerator(link) || "";
  } catch {
    return "";
  }
}

function createRibbonPath(
  link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>
) {
  const sourceNode = getNodeObject(link.source as NodeOrIndex);
  const targetNode = getNodeObject(link.target as NodeOrIndex);
  const width = link.width ?? 0;
  const sourceY = link.y0;
  const targetY = link.y1;

  if (
    !sourceNode ||
    !targetNode ||
    sourceNode.x1 === undefined ||
    targetNode.x0 === undefined ||
    sourceY === undefined ||
    targetY === undefined ||
    width <= 0
  ) {
    return null;
  }

  const sourceX = sourceNode.x1;
  const targetX = targetNode.x0;
  const midX = (sourceX + targetX) / 2;
  const halfWidth = Math.max(1, width / 2);
  const sourceTop = sourceY - halfWidth;
  const sourceBottom = sourceY + halfWidth;
  const targetTop = targetY - halfWidth;
  const targetBottom = targetY + halfWidth;

  return [
    `M${sourceX},${sourceTop}`,
    `C${midX},${sourceTop} ${midX},${targetTop} ${targetX},${targetTop}`,
    `L${targetX},${targetBottom}`,
    `C${midX},${targetBottom} ${midX},${sourceBottom} ${sourceX},${sourceBottom}`,
    "Z",
  ].join("");
}

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));

  if (r === 0) {
    return `M${x},${y}H${x + width}V${y + height}H${x}Z`;
  }

  return [
    `M${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${y + height - r}`,
    `Q${x + width},${y + height} ${x + width - r},${y + height}`,
    `H${x + r}`,
    `Q${x},${y + height} ${x},${y + height - r}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    "Z",
  ].join("");
}

function createSankeyGraph({
  data,
  sankeyGenerator,
}: {
  data: SankeyData;
  sankeyGenerator: ReturnType<typeof sankey<SankeyNodeDatum, SankeyLinkDatum>>;
}): SankeyGraph<SankeyNodeDatum, SankeyLinkDatum> {
  const clonedData = {
    nodes: data.nodes.map((node) => ({ ...node })),
    links: data.links.map((link) => ({ ...link })),
  };

  return sankeyGenerator(clonedData);
}

function createSankeyRoughLinkOptions({
  getLinkColorKey,
  getMaterial,
  graph,
  rough,
}: {
  getLinkColorKey?: SankeyChartProps["getLinkColorKey"];
  getMaterial: ChartMaterialRegistry["getMaterial"];
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  rough?: ChartRoughOptions;
}) {
  if (!rough) {
    return undefined;
  }

  return new Map(
    graph.links.map((link, index) => {
      const roughPath = createRibbonPath(link);
      const linkWidth = link.width ?? 1;
      const stroke = getMaterial(
        getLinkColorKey?.(link, index) ?? getDefaultSankeyLinkColorKey()
      ).color;

      return [
        index,
        {
          ...rough,
          fill: roughPath ? stroke : "none",
          stroke,
          strokeWidth: roughPath
            ? (rough.strokeWidth ?? 1)
            : Math.max(1, linkWidth),
        },
      ] as const;
    })
  );
}

function createSankeyRoughNodeOptions({
  getNodeColorKey,
  getMaterial,
  graph,
  rough,
}: {
  getNodeColorKey?: SankeyChartProps["getNodeColorKey"];
  getMaterial: ChartMaterialRegistry["getMaterial"];
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  rough?: ChartRoughOptions;
}) {
  if (!rough) {
    return undefined;
  }

  return new Map(
    graph.nodes.map((node, index) => {
      const fill = getMaterial(
        getNodeColorKey?.(node, index) ?? getDefaultSankeyNodeColorKey(node)
      ).color;

      return [
        index,
        {
          ...rough,
          fill,
          stroke: rough.stroke ?? fill,
          strokeWidth: rough.strokeWidth ?? 1,
        },
      ] as const;
    })
  );
}

function SankeyLinks({
  getLinkColorKey,
  getMaterial,
  getMarkState,
  hideTooltip,
  hover,
  links,
  roughByIndex,
  renderer,
  showMark,
  strokeOpacity,
}: {
  getLinkColorKey?: SankeyChartProps["getLinkColorKey"];
  getMaterial: ChartMaterialRegistry["getMaterial"];
  getMarkState: SankeyMarkInteraction["getMarkState"];
  hideTooltip: () => void;
  hover: SankeyHoverState | null;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  roughByIndex?: Map<number, ChartRoughOptions>;
  renderer: ChartRenderer;
  showMark: SankeyMarkInteraction["showMark"];
  strokeOpacity: number;
}) {
  return (
    <g className="sankey-links">
      {links.map((link, index) => {
        const path = createSankeyPath(link);
        if (!path || path.trim() === "") {
          return null;
        }

        const linkWidth = link.width ?? 1;
        const roughPath = renderer === "rough" ? createRibbonPath(link) : undefined;
        const sourceIndex = getNodeIndex(link.source as NodeOrIndex) ?? -1;
        const targetIndex = getNodeIndex(link.target as NodeOrIndex) ?? -1;
        const linkKey = getSankeyLinkKey(index);
        const markState = getMarkState({
          baseOpacity: strokeOpacity,
          key: linkKey,
          isRelated:
            hover?.type === "node"
              ? hover.key === getSankeyNodeKey(sourceIndex) ||
                hover.key === getSankeyNodeKey(targetIndex)
              : undefined,
        });
        const stroke = getMaterial(
          getLinkColorKey?.(link, index) ?? getDefaultSankeyLinkColorKey()
        ).color;
        const targetOpacity = markState.opacity;

        const handlePointerEnter = (event: React.PointerEvent<Element>) => {
          showMark({
            data: { type: "link", linkIndex: index },
            event,
            key: linkKey,
            type: "link",
          });
        };
        const handlePointerLeave = () => {
          hideTooltip();
        };

        return (
          <ChartMotionGroup
            animate={{ opacity: targetOpacity }}
            initial={{ opacity: strokeOpacity }}
            key={linkKey}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            style={{ cursor: "pointer" }}
            transition={chartMotion.hover}
          >
            <ChartRenderedPath
              color={stroke}
              d={roughPath ?? path}
              fill={renderer === "rough" && roughPath ? stroke : "none"}
              renderer={renderer}
              rough={roughByIndex?.get(index)}
              stroke={stroke}
              strokeWidth={Math.max(1, linkWidth)}
              textureKey={`sankey-link:${index}`}
              textureScopeId="sankey"
            />
            <path
              d={path}
              fill="none"
              pointerEvents="stroke"
              stroke="transparent"
              strokeWidth={Math.max(8, linkWidth)}
            />
          </ChartMotionGroup>
        );
      })}
    </g>
  );
}

function SankeyNodes({
  getNodeColorKey,
  getMaterial,
  getMarkState,
  hideTooltip,
  hover,
  innerWidth,
  links,
  nodeRadius,
  nodes,
  renderer,
  roughByIndex,
  showMark,
}: {
  getNodeColorKey?: SankeyChartProps["getNodeColorKey"];
  getMaterial: ChartMaterialRegistry["getMaterial"];
  getMarkState: SankeyMarkInteraction["getMarkState"];
  hideTooltip: () => void;
  hover: SankeyHoverState | null;
  innerWidth: number;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  nodeRadius: number;
  nodes: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>[];
  renderer: ChartRenderer;
  roughByIndex?: Map<number, ChartRoughOptions>;
  showMark: SankeyMarkInteraction["showMark"];
}) {
  return (
    <g className="sankey-nodes">
      {nodes.map((node, index) => {
        const nodeX = node.x0 ?? 0;
        const nodeY = node.y0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        const nodeHeight = (node.y1 ?? 0) - nodeY;
        const nodeKey = getSankeyNodeKey(index);
        const markState = getMarkState({
          key: nodeKey,
          isRelated: isNodeConnected({ hover, links, nodeIndex: index }),
        });
        const isLeftSide = nodeX < innerWidth / 2;
        const fill = getMaterial(
          getNodeColorKey?.(node, index) ?? getDefaultSankeyNodeColorKey(node)
        ).color;
        const displayValue = getNodeDisplayValue(node, index, links);
        const nodeOpacity =
          markState.isFaded ? chartHoverOpacity.visualFaded : 1;
        const valueOpacity =
          markState.isFaded ? chartHoverOpacity.textFaded : 0.6;

        const handlePointerEnter = (event: React.PointerEvent<Element>) => {
          showMark({
            data: { type: "node", nodeIndex: index },
            event,
            key: nodeKey,
            type: "node",
          });
        };
        const handlePointerLeave = () => {
          hideTooltip();
        };

        return (
          <SankeyNodeShape
            fill={fill}
            height={nodeHeight}
            isLeftSide={isLeftSide}
            key={`node-${node.name}`}
            name={node.name}
            nodeOpacity={nodeOpacity}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            renderer={renderer}
            nodeRoughOptions={roughByIndex?.get(index)}
            rx={nodeRadius}
            value={displayValue}
            valueOpacity={valueOpacity}
            width={nodeWidth}
            x={nodeX}
            y={nodeY}
          />
        );
      })}
    </g>
  );
}

function isNodeConnected({
  hover,
  links,
  nodeIndex,
}: {
  hover: SankeyHoverState | null;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  nodeIndex: number;
}) {
  if (!hover) {
    return true;
  }

  if (hover.type === "node") {
    if (hover.key === getSankeyNodeKey(nodeIndex)) {
      return true;
    }
    return links.some((link) => {
      const sourceIndex = getNodeIndex(link.source as NodeOrIndex);
      const targetIndex = getNodeIndex(link.target as NodeOrIndex);
      return (
        (sourceIndex !== undefined &&
          getSankeyNodeKey(sourceIndex) === hover.key &&
          targetIndex === nodeIndex) ||
        (targetIndex !== undefined &&
          getSankeyNodeKey(targetIndex) === hover.key &&
          sourceIndex === nodeIndex)
      );
    });
  }

  const link = links.find((_, index) => getSankeyLinkKey(index) === hover.key);
  if (!link) {
    return false;
  }
  const sourceIndex = getNodeIndex(link.source as NodeOrIndex);
  const targetIndex = getNodeIndex(link.target as NodeOrIndex);
  return sourceIndex === nodeIndex || targetIndex === nodeIndex;
}

function SankeyNodeShape({
  x,
  y,
  width,
  height,
  fill,
  rx,
  nodeOpacity,
  onPointerEnter,
  onPointerLeave,
  name,
  value,
  valueOpacity,
  isLeftSide,
  nodeRoughOptions,
  renderer,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  nodeOpacity: number;
  onPointerEnter: React.PointerEventHandler<Element>;
  onPointerLeave: () => void;
  renderer: ChartRenderer;
  name: string;
  value: number;
  valueOpacity: number;
  isLeftSide: boolean;
  nodeRoughOptions?: ChartRoughOptions;
}) {
  const labelX = isLeftSide ? x - 12 : x + width + 12;
  const path = roundedRectPath(x, y, width, height, rx);

  return (
    <ChartMotionGroup
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: "pointer" }}
    >
      <ChartMotionGroup
        animate={{ opacity: nodeOpacity }}
        initial={false}
        style={{ color: fill }}
        transition={chartMotion.hover}
      >
        <ChartRenderedPath
          color={fill}
          d={path}
          renderer={renderer}
          rough={nodeRoughOptions}
          textureKey={`sankey-node:${name}`}
          textureScopeId="sankey"
        />
      </ChartMotionGroup>
      <ChartMotionText
        animate={{ opacity: nodeOpacity, x: labelX }}
        className="fill-foreground font-medium text-[13px]"
        dy="0.35em"
        initial={false}
        textAnchor={isLeftSide ? "end" : "start"}
        transition={chartMotion.hover}
        y={y + height / 2}
      >
        {name}
      </ChartMotionText>
      <ChartMotionText
        animate={{ opacity: valueOpacity, x: labelX }}
        className="fill-foreground text-[11px]"
        dy="0.35em"
        initial={false}
        textAnchor={isLeftSide ? "end" : "start"}
        transition={chartMotion.hover}
        y={y + height / 2 + 16}
      >
        {intFmt(value)} sessions
      </ChartMotionText>
    </ChartMotionGroup>
  );
}

function SankeyTooltip({
  links,
  nodes,
  renderLinkTooltip,
  renderNodeTooltip,
  tooltipData,
  tooltipLeft,
  tooltipOpen,
  tooltipTop,
}: {
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  nodes: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>[];
  renderLinkTooltip?: SankeyChartProps["renderLinkTooltip"];
  renderNodeTooltip?: SankeyChartProps["renderNodeTooltip"];
  tooltipData: SankeyTooltipData | null;
  tooltipLeft?: number;
  tooltipOpen: boolean;
  tooltipTop?: number;
}) {
  if (!tooltipData || !tooltipOpen) {
    return null;
  }

  if (
    tooltipData.type === "node" &&
    tooltipData.nodeIndex !== undefined &&
    renderNodeTooltip
  ) {
    const node = nodes[tooltipData.nodeIndex];
    if (!node) {
      return null;
    }

    return (
      <ChartTooltip
        offset={16}
        visible
        x={tooltipLeft ?? 0}
        y={tooltipTop ?? 0}
      >
        <ChartTooltipPanel>
          {renderNodeTooltip({ node, index: tooltipData.nodeIndex })}
        </ChartTooltipPanel>
      </ChartTooltip>
    );
  }

  if (
    tooltipData.type === "link" &&
    tooltipData.linkIndex !== undefined &&
    renderLinkTooltip
  ) {
    const link = links[tooltipData.linkIndex];
    if (!link) {
      return null;
    }

    return (
      <ChartTooltip
        offset={16}
        visible
        x={tooltipLeft ?? 0}
        y={tooltipTop ?? 0}
      >
        <ChartTooltipPanel>
          {renderLinkTooltip({ link, index: tooltipData.linkIndex })}
        </ChartTooltipPanel>
      </ChartTooltip>
    );
  }

  return null;
}

function SankeyChartInner(props: SankeyChartCoreProps) {
  const { width, height } = props;

  if (width < 10 || height < 10) {
    return null;
  }

  return <SankeyChartCore {...props} />;
}

const SankeyVisualLayer = memo(function SankeyVisualLayer({
  getLinkColorKey,
  getMaterial,
  getMarkState,
  getNodeColorKey,
  graph,
  height,
  hideTooltip,
  hover,
  innerWidth,
  margin,
  nodeRadius,
  renderer,
  roughLinkOptionsByIndex,
  roughNodeOptionsByIndex,
  showMark,
  strokeOpacity,
  width,
}: {
  getLinkColorKey?: SankeyChartProps["getLinkColorKey"];
  getMaterial: ChartMaterialRegistry["getMaterial"];
  getMarkState: SankeyMarkInteraction["getMarkState"];
  getNodeColorKey?: SankeyChartProps["getNodeColorKey"];
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  height: number;
  hideTooltip: () => void;
  hover: SankeyHoverState | null;
  innerWidth: number;
  margin: Margin;
  nodeRadius: number;
  renderer: ChartRenderer;
  roughLinkOptionsByIndex?: Map<number, ChartRoughOptions>;
  roughNodeOptionsByIndex?: Map<number, ChartRoughOptions>;
  showMark: SankeyMarkInteraction["showMark"];
  strokeOpacity: number;
  width: number;
}) {
  return (
    <ChartSvg aria-hidden="true" height={height} width={width}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <SankeyLinks
          getLinkColorKey={getLinkColorKey}
          getMaterial={getMaterial}
          getMarkState={getMarkState}
          hideTooltip={hideTooltip}
          hover={hover}
          links={graph.links}
          renderer={renderer}
          roughByIndex={roughLinkOptionsByIndex}
          showMark={showMark}
          strokeOpacity={strokeOpacity}
        />
        <SankeyNodes
          getNodeColorKey={getNodeColorKey}
          getMaterial={getMaterial}
          getMarkState={getMarkState}
          hideTooltip={hideTooltip}
          hover={hover}
          innerWidth={innerWidth}
          links={graph.links}
          nodeRadius={nodeRadius}
          nodes={graph.nodes}
          renderer={renderer}
          roughByIndex={roughNodeOptionsByIndex}
          showMark={showMark}
        />
      </g>
    </ChartSvg>
  );
});

const SankeyChartCore = memo(function SankeyChartCore({
  data,
  getLinkColorKey,
  getMaterial,
  getNodeColorKey,
  height,
  margin,
  nodePadding,
  nodeRadius,
  nodeWidth,
  renderLinkTooltip,
  renderNodeTooltip,
  renderer,
  rough,
  strokeOpacity,
  width,
}: SankeyChartCoreProps) {
  const {
    currentTooltipData,
    followTooltip,
    getMarkState,
    hideTooltip,
    hover,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkInteraction<SankeyTooltipData, "node" | "link">();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const sankeyGenerator = useMemo(() => {
    return sankey<SankeyNodeDatum, SankeyLinkDatum>()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(sankeyCenter)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);
  }, [innerWidth, innerHeight, nodePadding, nodeWidth]);

  const graph = useMemo(
    () => createSankeyGraph({ data, sankeyGenerator }),
    [data, sankeyGenerator]
  );
  const roughLinkOptionsByIndex = useMemo(
    () =>
      renderer === "rough"
        ? createSankeyRoughLinkOptions({
            getLinkColorKey,
            getMaterial,
            graph,
            rough,
          })
        : undefined,
    [getLinkColorKey, getMaterial, graph, renderer, rough]
  );
  const roughNodeOptionsByIndex = useMemo(
    () =>
      renderer === "rough"
        ? createSankeyRoughNodeOptions({
            getMaterial,
            getNodeColorKey,
            graph,
            rough,
          })
        : undefined,
    [getMaterial, getNodeColorKey, graph, renderer, rough]
  );

  return (
    <ChartInteractionRoot
      onPointerLeave={hideTooltip}
      onPointerMove={followTooltip}
    >
      <SankeyVisualLayer
        getLinkColorKey={getLinkColorKey}
        getMaterial={getMaterial}
        getMarkState={getMarkState}
        getNodeColorKey={getNodeColorKey}
        graph={graph}
        height={height}
        hideTooltip={hideTooltip}
        hover={hover}
        innerWidth={innerWidth}
        margin={margin}
        nodeRadius={nodeRadius}
        renderer={renderer}
        roughLinkOptionsByIndex={roughLinkOptionsByIndex}
        roughNodeOptionsByIndex={roughNodeOptionsByIndex}
        showMark={showMark}
        strokeOpacity={strokeOpacity}
        width={width}
      />
      <SankeyTooltip
        links={graph.links}
        nodes={graph.nodes}
        renderLinkTooltip={renderLinkTooltip}
        renderNodeTooltip={renderNodeTooltip}
        tooltipData={currentTooltipData}
        tooltipLeft={tooltipLeft}
        tooltipOpen={tooltipOpen}
        tooltipTop={tooltipTop}
      />
    </ChartInteractionRoot>
  );
});

export function SankeyChart({
  className = "",
  config,
  data,
  getLinkColorKey,
  getNodeColorKey,
  layout,
  renderLinkTooltip,
  renderNodeTooltip,
  renderer,
  rough,
  strokeOpacity = 0.5,
}: SankeyChartProps) {
  const margin = { ...DEFAULT_MARGIN, ...layout?.margin };
  const aspectRatio = layout?.aspectRatio ?? "2 / 1";
  const isEmpty = data.nodes.length === 0 || data.links.length === 0;
  const resolvedRenderer = resolveChartRenderer(
    renderer ?? (rough ? "rough" : undefined),
    ["svg", "rough"]
  );
  const materialKeys = useMemo(
    () => ["landing", "link", "outcome", "source"],
    []
  );
  const materials = useChartMaterialRegistry({
    config,
    defaults: DEFAULT_SANKEY_CONFIG,
    keys: materialKeys,
    renderer: resolvedRenderer,
    rough,
    scope: "sankey",
    strategy: "relational",
  });

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={cn("relative w-full", className)}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No sankey data
        </div>
      }
      isEmpty={isEmpty}
      minHeight={240}
    >
      {({ height, width }) => (
        <SankeyChartInner
          data={data}
          getLinkColorKey={getLinkColorKey}
          getMaterial={materials.getMaterial}
          getNodeColorKey={getNodeColorKey}
          height={height}
          margin={margin}
          nodePadding={layout?.nodePadding ?? 24}
          nodeRadius={layout?.nodeRadius ?? 4}
          nodeWidth={layout?.nodeWidth ?? 16}
          renderLinkTooltip={renderLinkTooltip}
          renderNodeTooltip={renderNodeTooltip}
          renderer={resolvedRenderer}
          rough={rough}
          strokeOpacity={strokeOpacity}
          width={width}
        />
      )}
    </ChartContainer>
  );
}

SankeyChart.displayName = "SankeyChart";

export default SankeyChart;
