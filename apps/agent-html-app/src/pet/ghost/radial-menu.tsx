import {
  EyeIcon,
  HistoryIcon,
  MessageCircleIcon,
  PauseIcon,
  RefreshCwIcon,
  SettingsIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import type { GhostMenuItem } from "@/app/pet/ghost/types"

const GHOST_MENU_ITEMS: GhostMenuItem[] = [
  { Icon: SparklesIcon, label: "Focus", x: 0, y: -88 },
  { Icon: MessageCircleIcon, label: "Message", x: 62, y: -62 },
  { Icon: EyeIcon, label: "Inspect", x: 88, y: 0 },
  { Icon: HistoryIcon, label: "History", x: 62, y: 62 },
  { Icon: RefreshCwIcon, label: "Refresh", x: 0, y: 88 },
  { Icon: PauseIcon, label: "Pause", x: -62, y: 62 },
  { Icon: SettingsIcon, label: "Settings", x: -88, y: 0 },
  { Icon: XIcon, label: "Close", x: -62, y: -62 },
]

export function GhostRadialMenu({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      aria-hidden={!isOpen}
      className={[
        "pointer-events-none absolute top-1/2 left-1/2 z-10 size-0",
        isOpen ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {GHOST_MENU_ITEMS.map(({ Icon, label, x, y }, index) => (
        <button
          aria-label={label}
          className={[
            "absolute -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-lg shadow-black/15 backdrop-blur transition-[opacity,transform,background-color,color,border-color,box-shadow]",
            "hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-xl",
            isOpen
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-50 opacity-0",
          ].join(" ")}
          key={label}
          style={{
            transitionDelay: isOpen ? `${index * 35}ms` : "0ms",
            transform: isOpen
              ? `translate(${x}px, ${y}px) scale(1)`
              : "translate(0, 0) scale(0.5)",
          }}
          title={label}
          type="button"
        >
          <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      ))}
    </div>
  )
}
