import * as React from "react"
import { cn } from "@/app/shared/lib/utils"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { XIcon } from "lucide-react"

export type HeaderTab = {
  id: string
  isClosable: boolean
  label: string
}

const inactiveTabClassName =
  "bg-transparent text-sidebar-foreground/58 hover:text-sidebar-accent-foreground"

const activeTabClassName =
  "bg-card text-card-foreground ring-1 ring-sidebar-border/70"

export function DocumentTabRail({
  activeTabId,
  onCloseTab,
  onReorderTabs,
  onSelectTab,
  tabs,
}: {
  activeTabId: string | null
  onCloseTab: (tabId: string) => void
  onReorderTabs?: (orderedTabIds: string[]) => void
  onSelectTab: (tabId: string) => void
  tabs: HeaderTab[]
}) {
  const tabButtonRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const suppressNextSelectRef = React.useRef(false)
  const [activeDragTabId, setActiveDragTabId] = React.useState<string | null>(
    null
  )
  const sortableTabIds = React.useMemo(() => tabs.map((tab) => tab.id), [tabs])
  const activeDragTab = React.useMemo(
    () => tabs.find((tab) => tab.id === activeDragTabId) ?? null,
    [activeDragTabId, tabs]
  )
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const selectTab = (tabId: string, focus = false) => {
    if (suppressNextSelectRef.current) {
      suppressNextSelectRef.current = false
      return
    }

    onSelectTab(tabId)

    if (focus) {
      window.requestAnimationFrame(() => {
        tabButtonRefs.current.get(tabId)?.focus()
      })
    }
  }

  const selectAdjacentTab = (currentTabId: string, direction: 1 | -1) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTabId)

    if (currentIndex === -1 || tabs.length === 0) {
      return
    }

    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
    selectTab(tabs[nextIndex].id, true)
  }

  const handleDragStart = (event: DragStartEvent) => {
    suppressNextSelectRef.current = true
    setActiveDragTabId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    window.setTimeout(() => {
      suppressNextSelectRef.current = false
    }, 0)
    setActiveDragTabId(null)

    if (!onReorderTabs || !event.over || event.active.id === event.over.id) {
      return
    }

    const oldIndex = sortableTabIds.indexOf(String(event.active.id))
    const newIndex = sortableTabIds.indexOf(String(event.over.id))

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onReorderTabs(arrayMove(sortableTabIds, oldIndex, newIndex))
  }

  const handleDragCancel = () => {
    window.setTimeout(() => {
      suppressNextSelectRef.current = false
    }, 0)
    setActiveDragTabId(null)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div
        className="no-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden overscroll-x-contain py-1"
        data-selection="none"
      >
        <SortableContext
          items={sortableTabIds}
          strategy={horizontalListSortingStrategy}
        >
          <div
            aria-label="Open sections"
            className="flex min-w-full items-center gap-1"
            role="tablist"
          >
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeTabId
              const canTabToItem = isActive || (!activeTabId && index === 0)

              return (
                <DocumentTabItem
                  canTabToItem={canTabToItem}
                  isActive={isActive}
                  key={tab.id}
                  onCloseTab={onCloseTab}
                  onSelectAdjacentTab={selectAdjacentTab}
                  onSelectTab={selectTab}
                  ref={(element) => {
                    if (element) {
                      tabButtonRefs.current.set(tab.id, element)
                      return
                    }

                    tabButtonRefs.current.delete(tab.id)
                  }}
                  sortable={Boolean(onReorderTabs)}
                  tab={tab}
                  tabs={tabs}
                />
              )
            })}
          </div>
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragTab ? (
          <DocumentTabDragPreview
            isActive={activeDragTab.id === activeTabId}
            tab={activeDragTab}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function DocumentTabDragPreview({
  isActive,
  tab,
}: {
  isActive: boolean
  tab: HeaderTab
}) {
  return (
    <div
      className={cn(
        "pointer-events-none flex h-8 w-48 items-center rounded-lg pl-3 pr-2 text-sm font-medium",
        isActive ? activeTabClassName : inactiveTabClassName
      )}
    >
      <span className="truncate">{tab.label}</span>
    </div>
  )
}

const DocumentTabItem = React.forwardRef<
  HTMLButtonElement,
  {
    canTabToItem: boolean
    isActive: boolean
    onCloseTab: (tabId: string) => void
    onSelectAdjacentTab: (currentTabId: string, direction: 1 | -1) => void
    onSelectTab: (tabId: string, focus?: boolean) => void
    sortable: boolean
    tab: HeaderTab
    tabs: HeaderTab[]
  }
>(function DocumentTabItem(
  {
    canTabToItem,
    isActive,
    onCloseTab,
    onSelectAdjacentTab,
    onSelectTab,
    sortable,
    tab,
    tabs,
  },
  ref
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ disabled: !sortable, id: tab.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      data-tauri-no-drag=""
      className={cn(
        "group relative h-8 min-w-40 max-w-64 flex-[1_1_12rem] rounded-lg transition-colors",
        isActive ? activeTabClassName : inactiveTabClassName,
        isDragging && "opacity-70"
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <button
        data-tauri-no-drag=""
        data-cursor={sortable ? "drag" : "action"}
        aria-selected={isActive}
        className={cn(
          "flex size-full min-w-0 items-center justify-start rounded-lg border border-transparent bg-transparent pl-3 text-sm font-medium outline-none transition-[color,box-shadow,border-color] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          tab.isClosable ? "pr-9" : "pr-3",
          isActive
            ? "text-card-foreground hover:text-card-foreground"
            : "text-sidebar-foreground/58 hover:text-sidebar-accent-foreground"
        )}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault()
            onSelectAdjacentTab(tab.id, -1)
          }

          if (event.key === "ArrowRight") {
            event.preventDefault()
            onSelectAdjacentTab(tab.id, 1)
          }

          if (event.key === "Home") {
            event.preventDefault()
            onSelectTab(tabs[0]?.id ?? tab.id, true)
          }

          if (event.key === "End") {
            event.preventDefault()
            onSelectTab(tabs.at(-1)?.id ?? tab.id, true)
          }
        }}
        onClick={() => onSelectTab(tab.id)}
        ref={ref}
        role="tab"
        tabIndex={canTabToItem ? 0 : -1}
        title={tab.label}
        type="button"
        {...(sortable ? listeners : undefined)}
      >
        <span className="truncate">{tab.label}</span>
      </button>
      {tab.isClosable ? (
        <button
          data-tauri-no-drag=""
          data-cursor="action"
          aria-label={`Close ${tab.label} tab`}
          onClick={() => onCloseTab(tab.id)}
          title={`Close ${tab.label}`}
          className={cn(
            "absolute top-1/2 right-1 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-[opacity,color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isActive
              ? "text-card-foreground/60 hover:bg-muted hover:text-card-foreground"
              : "pointer-events-none text-sidebar-foreground/48 opacity-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
          )}
          type="button"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
})
