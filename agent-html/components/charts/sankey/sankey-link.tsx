"use client";

import type {
  SankeyLink as SankeyLinkType,
  SankeyNode as SankeyNodeType,
} from "d3-sankey";
import { motion } from "motion/react";
import { useCallback, useRef } from "react";
import rough from "roughjs";
import type { Options as RoughOptions } from "roughjs/bin/core";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import {
  type SankeyLinkDatum,
  type SankeyNodeDatum,
  useSankey,
} from "./sankey-context";

// Helper to get node index from link source/target
type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;

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
  /** Stroke opacity. Default: 0.5 */
  strokeOpacity?: number;
  /** Opacity when another link/node is hovered. Default: 0.1 */
  fadedOpacity?: number;
  /** Custom link color function (overrides gradient) */
  getLinkColor?: (
    link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  /** Draw links with roughjs while preserving Sankey layout and hover state. */
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
      strokeWidth: isRibbon ? (roughOptions.strokeWidth ?? 1) : Math.max(1, width),
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
  // Calculate target opacity
  const getTargetOpacity = () => {
    if (isFaded) {
      return fadedOpacity;
    }
    if (isHighlighted) {
      return Math.min(1, strokeOpacity * 1.3);
    }
    return strokeOpacity;
  };
  const targetOpacity = getTargetOpacity();

  // Ensure opacity values are always numbers
  const initialOpacity = strokeOpacity ?? 0.5;
  const animatedOpacity = targetOpacity ?? initialOpacity;

  if (roughOptions) {
    return (
      <motion.g
        animate={{ opacity: animatedOpacity }}
        initial={{ opacity: initialOpacity }}
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
      animate={{ opacity: animatedOpacity }}
      d={path}
      fill="none"
      initial={{ opacity: initialOpacity }}
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

  // Get color for a link (solid color, when not using gradient)
  const getLinkColorFn = useCallback(
    (link: SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>, index: number) => {
      if (getLinkColor) {
        return getLinkColor(link, index);
      }
      return "var(--chart-line-primary)";
    },
    [getLinkColor]
  );

  // Check if any element is hovered
  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;

  return (
    <g className="sankey-links">
      {/* Links */}
      {links.map((link, index) => {
        const path = createPath(link);
        const linkWidth = link.width ?? 1;
        const roughPath = roughOptions ? createRibbonPath(link) : undefined;

        // Skip if path is empty
        if (!path || path.trim() === "") {
          return null;
        }

        const sIdx = getNodeIndex(link.source as NodeOrIndex);
        const tIdx = getNodeIndex(link.target as NodeOrIndex);

        // Use fallback indices if we can't resolve
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

        const linkStroke = getLinkColorFn(link, index);

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
            stroke={linkStroke}
            strokeOpacity={strokeOpacity}
            width={linkWidth}
          />
        );
      })}
    </g>
  );
}

SankeyLink.displayName = "SankeyLink";

export default SankeyLink;
