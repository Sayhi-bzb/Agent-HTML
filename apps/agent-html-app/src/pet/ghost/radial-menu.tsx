import { MessageCircleIcon, WaypointsIcon } from "lucide-react"

import type { GhostMenuItem } from "@/app/pet/ghost/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/shared/ui/tooltip"

const GHOST_MENU_ITEMS: GhostMenuItem[] = [
  { Icon: MessageCircleIcon, id: "message", label: "Message", x: 62, y: -62 },
  { Icon: WaypointsIcon, id: "threads", label: "Threads", x: 0, y: -88 },
]

function getTooltipSide({ x, y }: Pick<GhostMenuItem, "x" | "y">) {
  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? "right" : "left"
  }

  return y > 0 ? "bottom" : "top"
}

export function GhostRadialMenu({
  isOpen,
  onSelect,
}: {
  isOpen: boolean
  onSelect?: (item: GhostMenuItem["id"]) => void
}) {
  return (
    <div
      aria-hidden={!isOpen}
      className={[
        "pointer-events-none absolute top-1/2 left-1/2 z-10 size-0",
        isOpen ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <TooltipProvider>
        {GHOST_MENU_ITEMS.map(({ Icon, id, label, x, y }, index) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                aria-label={label}
                className={[
                  "absolute -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-lg shadow-black/15 backdrop-blur transition-[opacity,transform,background-color,color,border-color,box-shadow]",
                  "hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-xl",
                  isOpen
                    ? "pointer-events-auto scale-100 opacity-100"
                    : "pointer-events-none scale-50 opacity-0",
                ].join(" ")}
                onClick={() => onSelect?.(id)}
                style={{
                  transitionDelay: isOpen ? `${index * 35}ms` : "0ms",
                  transform: isOpen
                    ? `translate(${x}px, ${y}px) scale(1)`
                    : "translate(0, 0) scale(0.5)",
                }}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side={getTooltipSide({ x, y })} sideOffset={8}>
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}
