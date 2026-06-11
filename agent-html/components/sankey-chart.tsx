"use client";

import { localPoint } from "@visx/event";
import { ParentSize } from "@visx/responsive";
import { sankey, sankeyCenter, sankeyLinkHorizontal } from "@visx/sankey";
import type {
  SankeyGraph,
  SankeyLink as SankeyLinkType,
  SankeyNode as SankeyNodeType,
} from "d3-sankey";
import { motion } from "motion/react";
import {
  memo,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import rough from "roughjs";
import type { Options as RoughOptions } from "roughjs/bin/core";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { cn } from "@/lib/utils";

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

function RoughLinkPath({
  path,
  stroke,
  width,
  roughOptions,
}: {
  path: string;
  stroke: string;
  width: number;
  roughOptions: RoughOptions;
}) {
  const groupRef = useRef<SVGGElement>(null);

  useIsomorphicLayoutEffect(() => {
    const group = groupRef.current;
    const svg = group?.ownerSVGElement;
    if (!(group && svg)) {
      return;
    }

    group.replaceChildren();
    const roughSvg = rough.svg(svg);
    const isRibbon = path.trim().endsWith("Z");
    const roughPath = roughSvg.path(path, {
      ...roughOptions,
      fill: isRibbon ? stroke : "none",
      stroke,
      strokeWidth: isRibbon
        ? (roughOptions.strokeWidth ?? 1)
        : Math.max(1, width),
    });
    group.appendChild(roughPath);
  }, [path, roughOptions, stroke, width]);

  return <g ref={groupRef} />;
}

function RoughNodeRect({
  x,
  y,
  width,
  height,
  fill,
  rx,
  roughOptions,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  roughOptions: RoughOptions;
}) {
  const groupRef = useRef<SVGGElement>(null);

  useIsomorphicLayoutEffect(() => {
    const group = groupRef.current;
    const svg = group?.ownerSVGElement;
    if (!(group && svg)) {
      return;
    }

    group.replaceChildren();
    const roughSvg = rough.svg(svg);
    const roughRect = roughSvg.path(roundedRectPath(x, y, width, height, rx), {
      ...roughOptions,
      fill,
      stroke: roughOptions.stroke ?? fill,
      strokeWidth: roughOptions.strokeWidth ?? 1,
    });
    group.appendChild(roughRect);
  }, [fill, height, roughOptions, rx, width, x, y]);

  return <g ref={groupRef} />;
}

function SankeyLinks({
  getLinkColor,
  hoveredLinkIndex,
  hoveredNodeIndex,
  links,
  roughOptions,
  setHoveredLinkIndex,
  setTooltipData,
  strokeOpacity,
}: {
  getLinkColor?: SankeyChartProps["getLinkColor"];
  hoveredLinkIndex: number | null;
  hoveredNodeIndex: number | null;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  roughOptions?: RoughOptions;
  setHoveredLinkIndex: (index: number | null) => void;
  setTooltipData: (data: SankeyTooltipData | null) => void;
  strokeOpacity: number;
}) {
  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;

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
        const isHighlighted =
          hoveredLinkIndex === index ||
          hoveredNodeIndex === sourceIndex ||
          hoveredNodeIndex === targetIndex;
        const isFaded = isAnyHovered && !isHighlighted;
        const stroke = getLinkColor
          ? getLinkColor(link, index)
          : "var(--chart-line-primary)";
        let targetOpacity = strokeOpacity;

        if (isFaded) {
          targetOpacity = 0.1;
        } else if (isHighlighted) {
          targetOpacity = Math.min(1, strokeOpacity * 1.3);
        }

        const handleMouseEnter = () => {
          setHoveredLinkIndex(index);
          setTooltipData({ type: "link", linkIndex: index });
        };
        const handleMouseLeave = () => {
          setHoveredLinkIndex(null);
          setTooltipData(null);
        };

        if (roughOptions) {
          return (
            <motion.g
              animate={{ opacity: targetOpacity }}
              initial={{ opacity: strokeOpacity }}
              key={`link-${sourceIndex}-${targetIndex}-${link.width ?? link.value ?? ""}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: "pointer" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <RoughLinkPath
                path={roughPath ?? path}
                roughOptions={roughOptions}
                stroke={stroke}
                width={linkWidth}
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            stroke={stroke}
            strokeWidth={Math.max(1, linkWidth)}
            style={{ cursor: "pointer" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
        );
      })}
    </g>
  );
}

function SankeyNodes({
  getNodeColor,
  hoveredLinkIndex,
  hoveredNodeIndex,
  innerWidth,
  links,
  nodeRadius,
  nodes,
  roughOptions,
  setHoveredNodeIndex,
  setTooltipData,
}: {
  getNodeColor?: SankeyChartProps["getNodeColor"];
  hoveredLinkIndex: number | null;
  hoveredNodeIndex: number | null;
  innerWidth: number;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  nodeRadius: number;
  nodes: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>[];
  roughOptions?: RoughOptions;
  setHoveredNodeIndex: (index: number | null) => void;
  setTooltipData: (data: SankeyTooltipData | null) => void;
}) {
  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;

  return (
    <g className="sankey-nodes">
      {nodes.map((node, index) => {
        const nodeX = node.x0 ?? 0;
        const nodeY = node.y0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        const nodeHeight = (node.y1 ?? 0) - nodeY;
        const isConnected = isNodeConnected({
          hoveredLinkIndex,
          hoveredNodeIndex,
          links,
          nodeIndex: index,
        });
        const isFaded = isAnyHovered && !isConnected;
        const isLeftSide = nodeX < innerWidth / 2;
        const fill = getNodeColor ? getNodeColor(node, index) : "var(--chart-1)";
        const displayValue = getNodeDisplayValue(node, index, links);

        const handleMouseEnter = () => {
          setHoveredNodeIndex(index);
          setTooltipData({ type: "node", nodeIndex: index });
        };
        const handleMouseLeave = () => {
          setHoveredNodeIndex(null);
          setTooltipData(null);
        };

        return (
          <SankeyNodeShape
            fill={fill}
            height={nodeHeight}
            isFaded={isFaded}
            isLeftSide={isLeftSide}
            key={`node-${node.name}`}
            name={node.name}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            roughOptions={roughOptions}
            rx={nodeRadius}
            value={displayValue}
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
  hoveredLinkIndex,
  hoveredNodeIndex,
  links,
  nodeIndex,
}: {
  hoveredLinkIndex: number | null;
  hoveredNodeIndex: number | null;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  nodeIndex: number;
}) {
  if (hoveredNodeIndex !== null) {
    if (hoveredNodeIndex === nodeIndex) {
      return true;
    }
    return links.some((link) => {
      const sourceIndex = getNodeIndex(link.source as NodeOrIndex);
      const targetIndex = getNodeIndex(link.target as NodeOrIndex);
      return (
        (sourceIndex === hoveredNodeIndex && targetIndex === nodeIndex) ||
        (targetIndex === hoveredNodeIndex && sourceIndex === nodeIndex)
      );
    });
  }

  if (hoveredLinkIndex !== null) {
    const link = links[hoveredLinkIndex];
    if (!link) {
      return false;
    }
    const sourceIndex = getNodeIndex(link.source as NodeOrIndex);
    const targetIndex = getNodeIndex(link.target as NodeOrIndex);
    return sourceIndex === nodeIndex || targetIndex === nodeIndex;
  }

  return false;
}

function SankeyNodeShape({
  x,
  y,
  width,
  height,
  fill,
  rx,
  isFaded,
  onMouseEnter,
  onMouseLeave,
  name,
  value,
  isLeftSide,
  roughOptions,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  isFaded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  name: string;
  value: number;
  isLeftSide: boolean;
  roughOptions?: RoughOptions;
}) {
  const labelX = isLeftSide ? x - 12 : x + width + 12;
  const nodeOpacity = isFaded ? 0.4 : 1;
  const valueOpacity = isFaded ? 0.32 : 0.6;

  return (
    <motion.g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {roughOptions ? (
        <motion.g
          animate={{ opacity: nodeOpacity }}
          initial={false}
          style={{ color: fill }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <RoughNodeRect
            fill={fill}
            height={height}
            roughOptions={roughOptions}
            rx={rx}
            width={width}
            x={x}
            y={y}
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
          transition={{ duration: 0.18, ease: "easeOut" }}
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
        transition={{ duration: 0.18, ease: "easeOut" }}
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
        transition={{ duration: 0.18, ease: "easeOut" }}
        y={y + height / 2 + 16}
      >
        {intFmt(value)} sessions
      </motion.text>
    </motion.g>
  );
}

interface PositionedTooltipProps {
  x: number;
  y: number;
  visible: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  containerWidth: number;
  containerHeight: number;
  offset?: number;
  className?: string;
  children: ReactNode;
  panelStyle?: CSSProperties;
}

function PositionedTooltip(props: PositionedTooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = props.containerRef.current;
  if (!(mounted && container)) {
    return null;
  }
  if (!props.visible) {
    return null;
  }
  return <PositionedTooltipInner {...props} container={container} />;
}

function PositionedTooltipInner({
  x,
  y,
  containerWidth,
  containerHeight,
  offset = 16,
  className = "",
  children,
  panelStyle,
  container,
}: Omit<PositionedTooltipProps, "visible" | "containerRef"> & {
  container: HTMLElement;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipWidthRef = useRef(180);
  const tooltipHeightRef = useRef(80);
  const tooltipWidth = tooltipWidthRef.current;
  const tooltipHeight = tooltipHeightRef.current;
  const shouldFlipX = x + tooltipWidth + offset > containerWidth;
  const targetX = shouldFlipX ? x - offset - tooltipWidth : x + offset;
  const targetY = Math.max(
    offset,
    Math.min(y - tooltipHeight / 2, containerHeight - tooltipHeight - offset)
  );
  const [staticPosition, setStaticPosition] = useState({
    left: targetX,
    top: targetY,
  });

  useIsomorphicLayoutEffect(() => {
    if (!tooltipRef.current) {
      return;
    }
    const el = tooltipRef.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width > 0) {
      tooltipWidthRef.current = width;
    }
    if (height > 0) {
      tooltipHeightRef.current = height;
    }

    const measuredWidth = tooltipWidthRef.current;
    const measuredHeight = tooltipHeightRef.current;
    const shouldFlip = x + measuredWidth + offset > containerWidth;
    const left = shouldFlip ? x - offset - measuredWidth : x + offset;
    const top = Math.max(
      offset,
      Math.min(y - measuredHeight / 2, containerHeight - measuredHeight - offset)
    );
    setStaticPosition({ left, top });
  }, [x, y, containerWidth, containerHeight, offset]);

  return createPortal(
    <div
      className={cn("pointer-events-none absolute z-50", className)}
      ref={tooltipRef}
      style={{ left: staticPosition.left, top: staticPosition.top }}
    >
      <div
        className="min-w-[140px] max-w-xs overflow-hidden rounded-md bg-foreground text-background shadow-md"
        style={panelStyle}
      >
        {children}
      </div>
    </div>,
    container
  );
}

function SankeyTooltip({
  containerRef,
  height,
  links,
  mousePos,
  nodes,
  renderLinkTooltip,
  renderNodeTooltip,
  tooltipData,
  width,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  height: number;
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  mousePos: { x: number; y: number } | null;
  nodes: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>[];
  renderLinkTooltip?: SankeyChartProps["renderLinkTooltip"];
  renderNodeTooltip?: SankeyChartProps["renderNodeTooltip"];
  tooltipData: SankeyTooltipData | null;
  width: number;
}) {
  if (!tooltipData || !mousePos) {
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
      <PositionedTooltip
        containerHeight={height}
        containerRef={containerRef}
        containerWidth={width}
        visible
        x={mousePos.x}
        y={mousePos.y}
      >
        {renderNodeTooltip({ node, index: tooltipData.nodeIndex })}
      </PositionedTooltip>
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
      <PositionedTooltip
        containerHeight={height}
        containerRef={containerRef}
        containerWidth={width}
        visible
        x={mousePos.x}
        y={mousePos.y}
      >
        {renderLinkTooltip({ link, index: tooltipData.linkIndex })}
      </PositionedTooltip>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<SankeyTooltipData | null>(
    null
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

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

  const graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum> = useMemo(() => {
    const clonedData = {
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    };
    return sankeyGenerator(clonedData);
  }, [data, sankeyGenerator]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const point = localPoint(event);
    if (point) {
      setMousePos({ x: point.x, y: point.y });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNodeIndex(null);
    setHoveredLinkIndex(null);
    setTooltipData(null);
    setMousePos(null);
  }, []);

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <svg
        aria-hidden="true"
        height={height}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        width={width}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <SankeyLinks
            getLinkColor={getLinkColor}
            hoveredLinkIndex={hoveredLinkIndex}
            hoveredNodeIndex={hoveredNodeIndex}
            links={graph.links}
            roughOptions={roughOptions}
            setHoveredLinkIndex={setHoveredLinkIndex}
            setTooltipData={setTooltipData}
            strokeOpacity={strokeOpacity}
          />
          <SankeyNodes
            getNodeColor={getNodeColor}
            hoveredLinkIndex={hoveredLinkIndex}
            hoveredNodeIndex={hoveredNodeIndex}
            innerWidth={innerWidth}
            links={graph.links}
            nodeRadius={nodeRadius}
            nodes={graph.nodes}
            roughOptions={roughOptions}
            setHoveredNodeIndex={setHoveredNodeIndex}
            setTooltipData={setTooltipData}
          />
        </g>
      </svg>
      <SankeyTooltip
        containerRef={containerRef}
        height={height}
        links={graph.links}
        mousePos={mousePos}
        nodes={graph.nodes}
        renderLinkTooltip={renderLinkTooltip}
        renderNodeTooltip={renderNodeTooltip}
        tooltipData={tooltipData}
        width={width}
      />
    </div>
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

  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio }}>
      <ParentSize>
        {({ width, height }) => (
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
      </ParentSize>
    </div>
  );
}

SankeyChart.displayName = "SankeyChart";

export default SankeyChart;
