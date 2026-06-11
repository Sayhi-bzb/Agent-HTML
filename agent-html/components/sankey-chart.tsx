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
  createContext,
  memo,
  type CSSProperties,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useCallback,
  useContext,
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

interface SankeyTooltipData {
  type: "node" | "link";
  nodeIndex?: number;
  linkIndex?: number;
  x: number;
  y: number;
  data: SankeyNodeDatum | SankeyLinkDatum;
}

interface SankeyContextValue {
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  nodes: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>[];
  links: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>[];
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: Margin;
  hoveredNodeIndex: number | null;
  hoveredLinkIndex: number | null;
  setHoveredNodeIndex: (index: number | null) => void;
  setHoveredLinkIndex: (index: number | null) => void;
  tooltipData: SankeyTooltipData | null;
  setTooltipData: Dispatch<SetStateAction<SankeyTooltipData | null>>;
  containerRef: RefObject<HTMLDivElement | null>;
  mousePos: { x: number; y: number } | null;
  createPath: (link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>) => string;
}

type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;

const DEFAULT_MARGIN: Margin = { top: 40, right: 180, bottom: 40, left: 180 };
const intFmt = new Intl.NumberFormat("en-US").format;
const SankeyContext = createContext<SankeyContextValue | null>(null);

function useSankey(): SankeyContextValue {
  const context = useContext(SankeyContext);
  if (!context) {
    throw new Error("useSankey must be used within a SankeyChart");
  }
  return context;
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

export interface SankeyChartProps {
  data: SankeyData;
  margin?: Partial<Margin>;
  aspectRatio?: string;
  nodeWidth?: number;
  nodePadding?: number;
  className?: string;
  children: ReactNode;
}

interface SankeyChartInnerProps {
  data: SankeyData;
  width: number;
  height: number;
  margin: Margin;
  nodeWidth: number;
  nodePadding: number;
  children: ReactNode;
}

function SankeyChartInner(props: SankeyChartInnerProps) {
  const { width, height } = props;

  if (width < 10 || height < 10) {
    return null;
  }

  return <SankeyChartCore {...props} />;
}

const SankeyChartCore = memo(function SankeyChartCore({
  data,
  width,
  height,
  margin,
  nodeWidth,
  nodePadding,
  children,
}: SankeyChartInnerProps) {
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
  }, [innerWidth, innerHeight, nodeWidth, nodePadding]);

  const graph = useMemo(() => {
    const clonedData = {
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    };
    return sankeyGenerator(clonedData);
  }, [data, sankeyGenerator]);

  const createPath = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: d3-sankey types are complex.
    (link: any) => {
      try {
        const pathGenerator = sankeyLinkHorizontal();
        return pathGenerator(link) || "";
      } catch {
        return "";
      }
    },
    []
  );

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

  const contextValue: SankeyContextValue = {
    graph,
    nodes: graph.nodes,
    links: graph.links,
    width,
    height,
    innerWidth,
    innerHeight,
    margin,
    hoveredNodeIndex,
    hoveredLinkIndex,
    setHoveredNodeIndex,
    setHoveredLinkIndex,
    tooltipData,
    setTooltipData,
    containerRef,
    mousePos,
    createPath,
  };

  return (
    <SankeyContext.Provider value={contextValue}>
      <div className="relative h-full w-full" ref={containerRef}>
        <svg
          aria-hidden="true"
          height={height}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          width={width}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {children}
          </g>
        </svg>
      </div>
    </SankeyContext.Provider>
  );
});

export function SankeyChart({
  data,
  margin: marginProp,
  aspectRatio = "2 / 1",
  nodeWidth = 16,
  nodePadding = 24,
  className = "",
  children,
}: SankeyChartProps) {
  const margin = { ...DEFAULT_MARGIN, ...marginProp };

  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio }}>
      <ParentSize>
        {({ width, height }) => (
          <SankeyChartInner
            data={data}
            height={height}
            margin={margin}
            nodePadding={nodePadding}
            nodeWidth={nodeWidth}
            width={width}
          >
            {children}
          </SankeyChartInner>
        )}
      </ParentSize>
    </div>
  );
}

SankeyChart.displayName = "SankeyChart";

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

export interface SankeyLinkProps {
  strokeOpacity?: number;
  fadedOpacity?: number;
  getLinkColor?: (
    link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  roughOptions?: RoughOptions;
}

interface AnimatedLinkProps {
  path: string;
  roughPath?: string;
  width: number;
  stroke: string;
  strokeOpacity: number;
  isFaded: boolean;
  isHighlighted: boolean;
  fadedOpacity: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  roughOptions?: RoughOptions;
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

function AnimatedLink({
  path,
  roughPath,
  width,
  stroke,
  strokeOpacity,
  isFaded,
  isHighlighted,
  fadedOpacity,
  onMouseEnter,
  onMouseLeave,
  roughOptions,
}: AnimatedLinkProps) {
  let targetOpacity = strokeOpacity;
  if (isFaded) {
    targetOpacity = fadedOpacity;
  } else if (isHighlighted) {
    targetOpacity = Math.min(1, strokeOpacity * 1.3);
  }

  if (roughOptions) {
    return (
      <motion.g
        animate={{ opacity: targetOpacity }}
        initial={{ opacity: strokeOpacity }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: "pointer" }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <RoughLinkPath
          path={roughPath ?? path}
          roughOptions={roughOptions}
          stroke={stroke}
          width={width}
        />
        <path
          d={path}
          fill="none"
          pointerEvents="stroke"
          stroke="transparent"
          strokeWidth={Math.max(8, width)}
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      stroke={stroke}
      strokeWidth={Math.max(1, width)}
      style={{ cursor: "pointer" }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    />
  );
}

export function SankeyLink({
  strokeOpacity = 0.5,
  fadedOpacity = 0.1,
  getLinkColor,
  roughOptions,
}: SankeyLinkProps) {
  const {
    links,
    hoveredNodeIndex,
    hoveredLinkIndex,
    setHoveredLinkIndex,
    setTooltipData,
    createPath,
  } = useSankey();

  const getLinkColorFn = useCallback(
    (link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>, index: number) => {
      if (getLinkColor) {
        return getLinkColor(link, index);
      }
      return "var(--chart-line-primary)";
    },
    [getLinkColor]
  );

  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;

  return (
    <g className="sankey-links">
      {links.map((link, index) => {
        const path = createPath(link);
        const linkWidth = link.width ?? 1;
        const roughPath = roughOptions ? createRibbonPath(link) : undefined;

        if (!path || path.trim() === "") {
          return null;
        }

        const sIdx = getNodeIndex(link.source as NodeOrIndex);
        const tIdx = getNodeIndex(link.target as NodeOrIndex);
        const sourceIdx =
          sIdx ?? (typeof link.source === "number" ? link.source : -1);
        const targetIdx =
          tIdx ?? (typeof link.target === "number" ? link.target : -1);

        const isHighlighted =
          hoveredLinkIndex === index ||
          hoveredNodeIndex === sourceIdx ||
          hoveredNodeIndex === targetIdx;
        const isFaded = isAnyHovered && !isHighlighted;

        const handleMouseEnter = () => {
          setHoveredLinkIndex(index);
          setTooltipData({
            type: "link",
            linkIndex: index,
            x: 0,
            y: 0,
            data: link,
          });
        };

        const handleMouseLeave = () => {
          setHoveredLinkIndex(null);
          setTooltipData(null);
        };

        return (
          <AnimatedLink
            fadedOpacity={fadedOpacity}
            isFaded={isFaded}
            isHighlighted={isHighlighted}
            key={`link-${sourceIdx}-${targetIdx}-${link.width ?? link.value ?? ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            path={path}
            roughPath={roughPath ?? undefined}
            roughOptions={roughOptions}
            stroke={getLinkColorFn(link, index)}
            strokeOpacity={strokeOpacity}
            width={linkWidth}
          />
        );
      })}
    </g>
  );
}

SankeyLink.displayName = "SankeyLink";

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

export interface SankeyNodeProps {
  lineCap?: number;
  fadedOpacity?: number;
  getNodeColor?: (
    node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  roughOptions?: RoughOptions;
}

interface AnimatedNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  isFaded: boolean;
  fadedOpacity: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  name: string;
  value: number;
  isLeftSide: boolean;
  roughOptions?: RoughOptions;
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

function AnimatedNode({
  x,
  y,
  width,
  height,
  fill,
  rx,
  isFaded,
  fadedOpacity,
  onMouseEnter,
  onMouseLeave,
  name,
  value,
  isLeftSide,
  roughOptions,
}: AnimatedNodeProps) {
  const nameLabelX = isLeftSide ? x - 12 : x + width + 12;
  const valueLabelX = isLeftSide ? x - 12 : x + width + 12;
  const nodeOpacity = isFaded ? fadedOpacity : 1;
  const nameOpacity = isFaded ? fadedOpacity : 1;
  const valueOpacity = isFaded ? fadedOpacity * 0.8 : 0.6;

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
        animate={{ opacity: nameOpacity, x: nameLabelX }}
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
        animate={{ opacity: valueOpacity, x: valueLabelX }}
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

export function SankeyNode({
  lineCap = 4,
  fadedOpacity = 0.4,
  getNodeColor: getNodeColorProp,
  roughOptions,
}: SankeyNodeProps) {
  const {
    nodes,
    links,
    width,
    margin,
    hoveredNodeIndex,
    hoveredLinkIndex,
    setHoveredNodeIndex,
    setTooltipData,
  } = useSankey();

  const getColor = useCallback(
    (
      node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
      index: number
    ): string => {
      if (getNodeColorProp) {
        return getNodeColorProp(node, index);
      }
      return "var(--chart-1)";
    },
    [getNodeColorProp]
  );

  const isNodeConnected = useCallback(
    (nodeIndex: number) => {
      if (hoveredNodeIndex !== null) {
        if (hoveredNodeIndex === nodeIndex) {
          return true;
        }
        return links.some((link) => {
          const sIdx = getNodeIndex(link.source as NodeOrIndex);
          const tIdx = getNodeIndex(link.target as NodeOrIndex);
          return (
            (sIdx === hoveredNodeIndex && tIdx === nodeIndex) ||
            (tIdx === hoveredNodeIndex && sIdx === nodeIndex)
          );
        });
      }
      if (hoveredLinkIndex !== null) {
        const link = links[hoveredLinkIndex];
        if (!link) {
          return false;
        }
        const sIdx = getNodeIndex(link.source as NodeOrIndex);
        const tIdx = getNodeIndex(link.target as NodeOrIndex);
        return sIdx === nodeIndex || tIdx === nodeIndex;
      }
      return false;
    },
    [hoveredNodeIndex, hoveredLinkIndex, links]
  );

  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;
  const innerWidth = width - margin.left - margin.right;

  return (
    <g className="sankey-nodes">
      {nodes.map((node, index) => {
        const nodeX = node.x0 ?? 0;
        const nodeY = node.y0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        const nodeHeight = (node.y1 ?? 0) - nodeY;
        const isConnected = isNodeConnected(index);
        const isFaded = isAnyHovered && !isConnected;
        const isLeftSide = nodeX < innerWidth / 2;

        let displayValue = 0;
        for (const link of links) {
          const sIdx = getNodeIndex(link.source as NodeOrIndex);
          const tIdx = getNodeIndex(link.target as NodeOrIndex);
          if (node.category === "source" && sIdx === index) {
            displayValue += link.value;
          } else if (node.category !== "source" && tIdx === index) {
            displayValue += link.value;
          }
        }

        const handleMouseEnter = () => {
          setHoveredNodeIndex(index);
          setTooltipData({
            type: "node",
            nodeIndex: index,
            x: 0,
            y: 0,
            data: node,
          });
        };

        const handleMouseLeave = () => {
          setHoveredNodeIndex(null);
          setTooltipData(null);
        };

        return (
          <AnimatedNode
            fadedOpacity={fadedOpacity}
            fill={getColor(node, index)}
            height={nodeHeight}
            isFaded={isFaded}
            isLeftSide={isLeftSide}
            key={`node-${node.name}`}
            name={node.name}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            rx={lineCap}
            roughOptions={roughOptions}
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

SankeyNode.displayName = "SankeyNode";

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
  const tw = tooltipWidthRef.current;
  const th = tooltipHeightRef.current;
  const shouldFlipX = x + tw + offset > containerWidth;
  const targetX = shouldFlipX ? x - offset - tw : x + offset;
  const targetY = Math.max(
    offset,
    Math.min(y - th / 2, containerHeight - th - offset)
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
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w > 0) {
      tooltipWidthRef.current = w;
    }
    if (h > 0) {
      tooltipHeightRef.current = h;
    }
    const w2 = tooltipWidthRef.current;
    const h2 = tooltipHeightRef.current;
    const flip = x + w2 + offset > containerWidth;
    const tx = flip ? x - offset - w2 : x + offset;
    const ty = Math.max(
      offset,
      Math.min(y - h2 / 2, containerHeight - h2 - offset)
    );
    setStaticPosition({ left: tx, top: ty });
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

export interface SankeyTooltipProps {
  nodeContent: (props: {
    node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => ReactNode;
  linkContent: (props: {
    link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => ReactNode;
  className?: string;
}

export function SankeyTooltip({
  nodeContent,
  linkContent,
  className = "",
}: SankeyTooltipProps) {
  const {
    tooltipData,
    containerRef,
    width,
    height,
    margin,
    nodes,
    links,
    mousePos,
  } = useSankey();

  if (!tooltipData) {
    return null;
  }

  const x = mousePos ? mousePos.x : tooltipData.x + margin.left;
  const y = mousePos ? mousePos.y : tooltipData.y + margin.top;

  if (tooltipData.type === "node" && tooltipData.nodeIndex !== undefined) {
    const node = nodes[tooltipData.nodeIndex];
    if (!node) {
      return null;
    }

    return (
      <PositionedTooltip
        className={className}
        containerHeight={height}
        containerRef={containerRef}
        containerWidth={width}
        visible
        x={x}
        y={y}
      >
        {nodeContent({ node, index: tooltipData.nodeIndex })}
      </PositionedTooltip>
    );
  }

  if (tooltipData.type === "link" && tooltipData.linkIndex !== undefined) {
    const link = links[tooltipData.linkIndex];
    if (!link) {
      return null;
    }

    return (
      <PositionedTooltip
        className={className}
        containerHeight={height}
        containerRef={containerRef}
        containerWidth={width}
        visible
        x={x}
        y={y}
      >
        {linkContent({ link, index: tooltipData.linkIndex })}
      </PositionedTooltip>
    );
  }

  return null;
}

SankeyTooltip.displayName = "SankeyTooltip";

export default SankeyChart;
