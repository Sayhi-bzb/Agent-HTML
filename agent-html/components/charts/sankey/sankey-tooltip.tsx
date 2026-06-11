"use client";

import type { SankeyLink, SankeyNode } from "d3-sankey";
import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { intFmt } from "../chart-formatters";
import {
  type SankeyLinkDatum,
  type SankeyNodeDatum,
  useSankey,
} from "./sankey-context";

type NodeOrIndex = SankeyNode<SankeyNodeDatum, SankeyLinkDatum> | number;

function getNodeName(nodeOrIndex: NodeOrIndex, fallbackIndex: number): string {
  if (typeof nodeOrIndex === "number") {
    return `Node ${nodeOrIndex}`;
  }
  return nodeOrIndex.name ?? `Node ${fallbackIndex}`;
}

interface TooltipRow {
  color: string;
  label: string;
  value: string | number;
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
  panelStyle?: React.CSSProperties;
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

  useLayoutEffect(() => {
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
  }, [
    x,
    y,
    containerWidth,
    containerHeight,
    offset,
  ]);

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

function TooltipRows({
  title,
  rows,
  children,
}: {
  title?: string;
  rows: TooltipRow[];
  children?: ReactNode;
}) {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-col gap-2 px-3 py-2 text-xs">
        {title && <div className="font-medium">{title}</div>}
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div
              className="flex items-center justify-between gap-4"
              key={`${row.label}-${row.color}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="opacity-80">{row.label}</span>
              </div>
              <span className="font-medium tabular-nums">
                {typeof row.value === "number" ? intFmt(row.value) : row.value}
              </span>
            </div>
          ))}
        </div>

        {children && (
          <div className="mt-2 transition-opacity duration-200 ease-out">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export interface SankeyTooltipProps {
  /** Custom content renderer for node tooltips */
  nodeContent?: (props: {
    node: SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => ReactNode;
  /** Custom content renderer for link tooltips */
  linkContent?: (props: {
    link: SankeyLink<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => ReactNode;
  /** Value formatter function */
  formatValue?: (value: number) => string;
  /** Custom class name */
  className?: string;
}

export function SankeyTooltip({
  nodeContent,
  linkContent,
  formatValue = intFmt,
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

  // Use mouse position if available, otherwise fallback to anchor point
  const x = mousePos ? mousePos.x : tooltipData.x + margin.left;
  const y = mousePos ? mousePos.y : tooltipData.y + margin.top;

  // Render node tooltip
  if (tooltipData.type === "node" && tooltipData.nodeIndex !== undefined) {
    const node = nodes[tooltipData.nodeIndex];
    if (!node) {
      return null;
    }

    // Calculate total value flowing through this node
    const totalValue = node.value ?? 0;

    // Custom content
    if (nodeContent) {
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

    // Default node tooltip
    const rows: TooltipRow[] = [
      {
        color: "var(--chart-line-primary)",
        label: "Sessions",
        value: formatValue(totalValue),
      },
    ];

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
        <TooltipRows rows={rows} title={node.name} />
      </PositionedTooltip>
    );
  }

  // Render link tooltip
  if (tooltipData.type === "link" && tooltipData.linkIndex !== undefined) {
    const link = links[tooltipData.linkIndex];
    if (!link) {
      return null;
    }

    // Get source and target names
    const sourceName = getNodeName(
      link.source as NodeOrIndex,
      tooltipData.linkIndex
    );
    const targetName = getNodeName(
      link.target as NodeOrIndex,
      tooltipData.linkIndex
    );

    // Custom content
    if (linkContent) {
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

    // Default link tooltip
    const rows: TooltipRow[] = [
      {
        color: "var(--chart-foreground-muted)",
        label: "Flow",
        value: formatValue(link.value),
      },
    ];

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
        <TooltipRows rows={rows} title={`${sourceName} → ${targetName}`} />
      </PositionedTooltip>
    );
  }

  return null;
}

SankeyTooltip.displayName = "SankeyTooltip";

export default SankeyTooltip;
