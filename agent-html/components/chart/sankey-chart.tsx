"use client";

import { sankey, sankeyCenter, sankeyLinkHorizontal } from "@visx/sankey";
import type {
  SankeyGraph,
  SankeyLink as SankeyLinkType,
  SankeyNode as SankeyNodeType,
} from "d3-sankey";
import { motion } from "motion/react";
import {
  memo,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import type { Options as RoughOptions } from "roughjs/bin/core";
import { cn } from "@/lib/utils";
import {
  type ChartHoverState,
  ChartContainer,
  ChartInteractionRoot,
  ChartSvg,
  ChartTooltip,
  ChartTooltipPanel,
  chartHoverOpacity,
  chartHoverTransition,
  getChartHoverOpacity,
  getChartHoverPresence,
  useChartMarkTooltip,
} from "../ui/chart";
import { RoughPath } from "@/lib/rough-svg";

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

interface SankeyChartProps {
  className?: string;
  data: SankeyData;
  getLinkColor?: (
    link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  getNodeColor?: (
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
  roughOptions?: RoughOptions;
  strokeOpacity?: number;
}

interface SankeyChartCoreProps {
  data: SankeyData;
  getLinkColor?: SankeyChartProps["getLinkColor"];
  getNodeColor?: SankeyChartProps["getNodeColor"];
  margin: Margin;
  nodePadding: number;
  nodeRadius: number;
  nodeWidth: number;
  renderLinkTooltip?: SankeyChartProps["renderLinkTooltip"];
  renderNodeTooltip?: SankeyChartProps["renderNodeTooltip"];
  roughOptions?: RoughOptions;
  strokeOpacity: number;
  width: number;
  height: number;
}

type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;

const DEFAULT_MARGIN: Margin = { top: 40, right: 180, bottom: 40, left: 180 };
const intFmt = new Intl.NumberFormat("en-US").format;

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
  getLinkColor,
  graph,
  roughOptions,
}: {
  getLinkColor?: SankeyChartProps["getLinkColor"];
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  roughOptions?: RoughOptions;
}) {
  if (!roughOptions) {
    return undefined;
  }

  return new Map(
    graph.links.map((link, index) => {
      const roughPath = createRibbonPath(link);
      const linkWidth = link.width ?? 1;
      const stroke = getLinkColor
        ? getLinkColor(link, index)
        : "var(--chart-line-primary)";

      return [
        index,
        {
          ...roughOptions,
          fill: roughPath ? stroke : "none",
          stroke,
          strokeWidth: roughPath
            ? (roughOptions.strokeWidth ?? 1)
            : Math.max(1, linkWidth),
        },
      ] as const;
    })
  );
}

function createSankeyRoughNodeOptions({
  getNodeColor,
  graph,
  roughOptions,
}: {
  getNodeColor?: SankeyChartProps["getNodeColor"];
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  roughOptions?: RoughOptions;
}) {
  if (!roughOptions) {
    return undefined;
  }

  return new Map(
    graph.nodes.map((node, index) => {
      const fill = getNodeColor ? getNodeColor(node, index) : "var(--chart-1)";

      return [
        index,
        {
          ...roughOptions,
          fill,
          stroke: roughOptions.stroke ?? fill,
          strokeWidth: roughOptions.strokeWidth ?? 1,
        },
      ] as const;
    })
  );
}

function SankeyLinks({
  getLinkColor,
  hideTooltip,
  hover,
  links,
  roughOptions,
  roughOptionsByIndex,
  setHover,
  showTooltip,
  strokeOpacity,
}: {
  getLinkColor?: SankeyChartProps["getLinkColor"];
  hideTooltip: () => void;
  hover: SankeyHoverState | null;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  roughOptions?: RoughOptions;
  roughOptionsByIndex?: Map<number, RoughOptions>;
  setHover: (hover: SankeyHoverState | null) => void;
  showTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: SankeyTooltipData
  ) => void;
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
        const roughPath = roughOptions ? createRibbonPath(link) : undefined;
        const sourceIndex = getNodeIndex(link.source as NodeOrIndex) ?? -1;
        const targetIndex = getNodeIndex(link.target as NodeOrIndex) ?? -1;
        const presence = getChartHoverPresence({
          hover,
          isRelated:
            hover?.type === "link"
              ? hover.key === index
              : hover?.key === sourceIndex || hover?.key === targetIndex,
        });
        const stroke = getLinkColor
          ? getLinkColor(link, index)
          : "var(--chart-line-primary)";
        const targetOpacity = getChartHoverOpacity({
          baseOpacity: strokeOpacity,
          presence,
        });

        const handlePointerEnter = (event: React.PointerEvent<Element>) => {
          setHover({ key: index, type: "link" });
          showTooltip(event, { type: "link", linkIndex: index });
        };
        const handlePointerLeave = () => {
          hideTooltip();
        };

        if (roughOptions) {
          const stableRoughOptions = roughOptionsByIndex?.get(index);

          return (
            <motion.g
              animate={{ opacity: targetOpacity }}
              initial={{ opacity: strokeOpacity }}
              key={`link-${sourceIndex}-${targetIndex}-${link.width ?? link.value ?? ""}`}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              style={{ cursor: "pointer" }}
              transition={chartHoverTransition}
            >
              <RoughPath
                d={roughPath ?? path}
                options={stableRoughOptions}
              />
              <path
                d={path}
                fill="none"
                pointerEvents="stroke"
                stroke="transparent"
                strokeWidth={Math.max(8, linkWidth)}
              />
            </motion.g>
          );
        }

        return (
          <motion.path
            animate={{ opacity: targetOpacity }}
            d={path}
            fill="none"
            initial={{ opacity: strokeOpacity }}
            key={`link-${sourceIndex}-${targetIndex}-${link.width ?? link.value ?? ""}`}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            stroke={stroke}
            strokeWidth={Math.max(1, linkWidth)}
            style={{ cursor: "pointer" }}
            transition={chartHoverTransition}
          />
        );
      })}
    </g>
  );
}

function SankeyNodes({
  getNodeColor,
  hideTooltip,
  hover,
  innerWidth,
  links,
  nodeRadius,
  nodes,
  roughOptions,
  roughOptionsByIndex,
  setHover,
  showTooltip,
}: {
  getNodeColor?: SankeyChartProps["getNodeColor"];
  hideTooltip: () => void;
  hover: SankeyHoverState | null;
  innerWidth: number;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  nodeRadius: number;
  nodes: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>[];
  roughOptions?: RoughOptions;
  roughOptionsByIndex?: Map<number, RoughOptions>;
  setHover: (hover: SankeyHoverState | null) => void;
  showTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: SankeyTooltipData
  ) => void;
}) {
  return (
    <g className="sankey-nodes">
      {nodes.map((node, index) => {
        const nodeX = node.x0 ?? 0;
        const nodeY = node.y0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        const nodeHeight = (node.y1 ?? 0) - nodeY;
        const presence = getChartHoverPresence({
          hover,
          isRelated: isNodeConnected({ hover, links, nodeIndex: index }),
        });
        const isLeftSide = nodeX < innerWidth / 2;
        const fill = getNodeColor ? getNodeColor(node, index) : "var(--chart-1)";
        const displayValue = getNodeDisplayValue(node, index, links);
        const nodeOpacity =
          presence === "faded" ? chartHoverOpacity.visualFaded : 1;
        const valueOpacity =
          presence === "faded" ? chartHoverOpacity.textFaded : 0.6;

        const handlePointerEnter = (event: React.PointerEvent<Element>) => {
          setHover({ key: index, type: "node" });
          showTooltip(event, { type: "node", nodeIndex: index });
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
            roughOptions={roughOptions}
            stableRoughOptions={roughOptionsByIndex?.get(index)}
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
    if (hover.key === nodeIndex) {
      return true;
    }
    return links.some((link) => {
      const sourceIndex = getNodeIndex(link.source as NodeOrIndex);
      const targetIndex = getNodeIndex(link.target as NodeOrIndex);
      return (
        (sourceIndex === hover.key && targetIndex === nodeIndex) ||
        (targetIndex === hover.key && sourceIndex === nodeIndex)
      );
    });
  }

  const link = links[Number(hover.key)];
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
  roughOptions,
  stableRoughOptions,
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
  name: string;
  value: number;
  valueOpacity: number;
  isLeftSide: boolean;
  roughOptions?: RoughOptions;
  stableRoughOptions?: RoughOptions;
}) {
  const labelX = isLeftSide ? x - 12 : x + width + 12;

  return (
    <motion.g
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: "pointer" }}
    >
      {roughOptions ? (
        <motion.g
          animate={{ opacity: nodeOpacity }}
          initial={false}
          style={{ color: fill }}
          transition={chartHoverTransition}
        >
          <RoughPath
            d={roundedRectPath(x, y, width, height, rx)}
            options={stableRoughOptions}
          />
        </motion.g>
      ) : (
        <motion.rect
          animate={{ opacity: nodeOpacity }}
          fill={fill}
          height={height}
          initial={false}
          rx={rx}
          ry={rx}
          transition={chartHoverTransition}
          width={width}
          x={x}
          y={y}
        />
      )}
      <motion.text
        animate={{ opacity: nodeOpacity, x: labelX }}
        className="fill-foreground font-medium text-[13px]"
        dy="0.35em"
        initial={false}
        textAnchor={isLeftSide ? "end" : "start"}
        transition={chartHoverTransition}
        y={y + height / 2}
      >
        {name}
      </motion.text>
      <motion.text
        animate={{ opacity: valueOpacity, x: labelX }}
        className="fill-foreground text-[11px]"
        dy="0.35em"
        initial={false}
        textAnchor={isLeftSide ? "end" : "start"}
        transition={chartHoverTransition}
        y={y + height / 2 + 16}
      >
        {intFmt(value)} sessions
      </motion.text>
    </motion.g>
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
  getLinkColor,
  getNodeColor,
  graph,
  height,
  hideTooltip,
  hover,
  innerWidth,
  margin,
  nodeRadius,
  roughOptions,
  roughLinkOptionsByIndex,
  roughNodeOptionsByIndex,
  setHover,
  showTooltip,
  strokeOpacity,
  width,
}: {
  getLinkColor?: SankeyChartProps["getLinkColor"];
  getNodeColor?: SankeyChartProps["getNodeColor"];
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  height: number;
  hideTooltip: () => void;
  hover: SankeyHoverState | null;
  innerWidth: number;
  margin: Margin;
  nodeRadius: number;
  roughOptions?: RoughOptions;
  roughLinkOptionsByIndex?: Map<number, RoughOptions>;
  roughNodeOptionsByIndex?: Map<number, RoughOptions>;
  setHover: (hover: SankeyHoverState | null) => void;
  showTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: SankeyTooltipData
  ) => void;
  strokeOpacity: number;
  width: number;
}) {
  return (
    <ChartSvg aria-hidden="true" height={height} width={width}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <SankeyLinks
          getLinkColor={getLinkColor}
          hideTooltip={hideTooltip}
          hover={hover}
          links={graph.links}
          roughOptions={roughOptions}
          roughOptionsByIndex={roughLinkOptionsByIndex}
          setHover={setHover}
          showTooltip={showTooltip}
          strokeOpacity={strokeOpacity}
        />
        <SankeyNodes
          getNodeColor={getNodeColor}
          hideTooltip={hideTooltip}
          hover={hover}
          innerWidth={innerWidth}
          links={graph.links}
          nodeRadius={nodeRadius}
          nodes={graph.nodes}
          roughOptions={roughOptions}
          roughOptionsByIndex={roughNodeOptionsByIndex}
          setHover={setHover}
          showTooltip={showTooltip}
        />
      </g>
    </ChartSvg>
  );
});

const SankeyChartCore = memo(function SankeyChartCore({
  data,
  getLinkColor,
  getNodeColor,
  height,
  margin,
  nodePadding,
  nodeRadius,
  nodeWidth,
  renderLinkTooltip,
  renderNodeTooltip,
  roughOptions,
  strokeOpacity,
  width,
}: SankeyChartCoreProps) {
  const {
    currentTooltipData,
    followTooltip,
    hideTooltip,
    hover,
    setHover,
    showTooltip,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkTooltip<SankeyTooltipData, "node" | "link">();

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
    () => createSankeyRoughLinkOptions({ getLinkColor, graph, roughOptions }),
    [getLinkColor, graph, roughOptions]
  );
  const roughNodeOptionsByIndex = useMemo(
    () => createSankeyRoughNodeOptions({ getNodeColor, graph, roughOptions }),
    [getNodeColor, graph, roughOptions]
  );

  const handleHoverChange = useCallback((nextHover: SankeyHoverState | null) => {
    setHover(nextHover);
  }, [setHover]);

  return (
    <ChartInteractionRoot
      onPointerLeave={hideTooltip}
      onPointerMove={followTooltip}
    >
      <SankeyVisualLayer
        getLinkColor={getLinkColor}
        getNodeColor={getNodeColor}
        graph={graph}
        height={height}
        hideTooltip={hideTooltip}
        hover={hover}
        innerWidth={innerWidth}
        margin={margin}
        nodeRadius={nodeRadius}
        roughLinkOptionsByIndex={roughLinkOptionsByIndex}
        roughNodeOptionsByIndex={roughNodeOptionsByIndex}
        roughOptions={roughOptions}
        setHover={handleHoverChange}
        showTooltip={showTooltip}
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
  data,
  getLinkColor,
  getNodeColor,
  layout,
  renderLinkTooltip,
  renderNodeTooltip,
  roughOptions,
  strokeOpacity = 0.5,
}: SankeyChartProps) {
  const margin = { ...DEFAULT_MARGIN, ...layout?.margin };
  const aspectRatio = layout?.aspectRatio ?? "2 / 1";
  const isEmpty = data.nodes.length === 0 || data.links.length === 0;

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={cn("relative w-full", className)}
      config={{}}
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
          getLinkColor={getLinkColor}
          getNodeColor={getNodeColor}
          height={height}
          margin={margin}
          nodePadding={layout?.nodePadding ?? 24}
          nodeRadius={layout?.nodeRadius ?? 4}
          nodeWidth={layout?.nodeWidth ?? 16}
          renderLinkTooltip={renderLinkTooltip}
          renderNodeTooltip={renderNodeTooltip}
          roughOptions={roughOptions}
          strokeOpacity={strokeOpacity}
          width={width}
        />
      )}
    </ChartContainer>
  );
}

SankeyChart.displayName = "SankeyChart";

export default SankeyChart;
