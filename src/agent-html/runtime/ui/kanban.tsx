import * as React from "react"
import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DraggableSyntheticListeners,
  type DropAnimation,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { cn } from "@/agent-html/lib/utils"
import { IntrinsicScrollFrame } from "@/agent-html/runtime/ui/intrinsic-scroll-frame"

type KanbanColumnData = {
  value: string
  title: string
  items: KanbanItemData[]
}

type KanbanItemData = {
  value: string
  content: React.ReactNode
}

type KanbanColumnElement = React.ReactElement<{
  value?: string
  title?: string
  children?: React.ReactNode
}>

type KanbanItemElement = React.ReactElement<{
  value?: string
  children?: React.ReactNode
}>

function parseInitialColumns(children: React.ReactNode): KanbanColumnData[] {
  return React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((column) => {
      const columnElement = column as KanbanColumnElement
      const items = React.Children.toArray(columnElement.props.children)
        .filter(React.isValidElement)
        .map((item) => {
          const itemElement = item as KanbanItemElement

          return {
            value: itemElement.props.value ?? "",
            content: itemElement.props.children,
          }
        })

      return {
        value: columnElement.props.value ?? "",
        title: columnElement.props.title ?? "",
        items,
      }
    })
}

function findColumnIndex(columns: KanbanColumnData[], itemValue: string) {
  return columns.findIndex((column) =>
    column.items.some((item) => item.value === itemValue)
  )
}

function findItemIndex(column: KanbanColumnData, itemValue: string) {
  return column.items.findIndex((item) => item.value === itemValue)
}

function columnDndId(value: string) {
  return `column:${value}`
}

function itemDndId(value: string) {
  return `item:${value}`
}

function valueFromDndId(id: string) {
  return id.slice(id.indexOf(":") + 1)
}

function isColumnDndId(id: string) {
  return id.startsWith("column:")
}

function cloneColumns(columns: KanbanColumnData[]) {
  return columns.map((column) => ({
    ...column,
    items: [...column.items],
  }))
}

function moveKanbanItem(
  columns: KanbanColumnData[],
  activeId: string,
  overId: string
) {
  if (activeId === overId) {
    return columns
  }

  const activeValue = valueFromDndId(activeId)
  const overValue = valueFromDndId(overId)
  const activeColumnIndex = findColumnIndex(columns, activeValue)
  if (activeColumnIndex === -1) {
    return columns
  }

  const overColumnIndex = isColumnDndId(overId)
    ? columns.findIndex((column) => column.value === overValue)
    : findColumnIndex(columns, overValue)

  if (overColumnIndex === -1) {
    return columns
  }

  const nextColumns = cloneColumns(columns)
  const activeColumn = nextColumns[activeColumnIndex]
  const overColumn = nextColumns[overColumnIndex]
  const activeIndex = findItemIndex(activeColumn, activeValue)
  if (activeIndex === -1) {
    return columns
  }

  if (activeColumnIndex === overColumnIndex) {
    const overIndex = isColumnDndId(overId)
      ? overColumn.items.length - 1
      : findItemIndex(overColumn, overValue)

    if (overIndex === -1 || activeIndex === overIndex) {
      return columns
    }

    activeColumn.items = arrayMove(activeColumn.items, activeIndex, overIndex)
    return nextColumns
  }

  const [movedItem] = activeColumn.items.splice(activeIndex, 1)
  const overIndex = isColumnDndId(overId)
    ? overColumn.items.length
    : findItemIndex(overColumn, overValue)
  overColumn.items.splice(
    overIndex === -1 ? overColumn.items.length : overIndex,
    0,
    movedItem
  )
  return nextColumns
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.35",
      },
    },
  }),
}

function Kanban({ children }: { children?: React.ReactNode }) {
  const [columns, setColumns] = React.useState(() =>
    parseInitialColumns(children)
  )
  const [activeItem, setActiveItem] = React.useState<KanbanItemData | null>(null)
  const lastOverIdRef = React.useRef<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const collisionDetection = React.useCallback<CollisionDetection>(
    (args) => {
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, "id")

      if (!overId) {
        return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : []
      }

      const overIdString = String(overId)
      if (isColumnDndId(overIdString)) {
        const columnValue = valueFromDndId(overIdString)
        const column = columns.find((candidate) => candidate.value === columnValue)

        if (column && column.items.length > 0) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) =>
              column.items.some((item) => itemDndId(item.value) === container.id)
            ),
          })

          if (closestItem.length > 0) {
            overId = closestItem[0]?.id ?? overId
          }
        }
      }

      lastOverIdRef.current = String(overId)
      return [{ id: overId }]
    },
    [columns]
  )

  function handleDragStart(event: DragStartEvent) {
    const itemValue = valueFromDndId(String(event.active.id))
    const column = columns.find((candidate) =>
      candidate.items.some((item) => item.value === itemValue)
    )
    setActiveItem(
      column?.items.find((item) => item.value === itemValue) ?? null
    )
    lastOverIdRef.current = String(event.active.id)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) {
      return
    }

    setColumns((currentColumns) =>
      moveKanbanItem(currentColumns, String(active.id), String(over.id))
    )
  }

  function handleDragEnd(_event: DragEndEvent) {
    setActiveItem(null)
    lastOverIdRef.current = null
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <IntrinsicScrollFrame>
        <div
          className={cn(
            "grid w-full min-w-max auto-cols-[16rem] grid-flow-col gap-4 pb-2",
            activeItem && "cursor-grabbing"
          )}
          data-dragging={activeItem ? "" : undefined}
          data-slot="kanban"
        >
          {columns.map((column) => (
            <KanbanColumnView column={column} key={column.value} />
          ))}
        </div>
      </IntrinsicScrollFrame>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? <KanbanItemCard dragging item={activeItem} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumnView({ column }: { column: KanbanColumnData }) {
  const { setNodeRef } = useDroppable({
    id: columnDndId(column.value),
  })

  return (
    <section
      className="flex min-h-40 min-w-64 flex-col rounded-xl border bg-muted/40 p-3 transition-colors duration-150"
      data-slot="kanban-column"
      data-value={column.value}
      ref={setNodeRef}
    >
      <div
        className="mb-3 flex items-center justify-between gap-3"
        data-slot="kanban-column-header"
      >
        <h3 className="text-sm font-medium">{column.title}</h3>
        <span className="text-xs text-muted-foreground">{column.items.length}</span>
      </div>
      <SortableContext
        items={column.items.map((item) => itemDndId(item.value))}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="flex min-h-24 flex-1 flex-col gap-2"
          data-slot="kanban-column-content"
        >
          {column.items.map((item) => (
            <SortableKanbanItem item={item} key={item.value} />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableKanbanItem({ item }: { item: KanbanItemData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemDndId(item.value) })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <KanbanItemCard
      attributes={attributes}
      dragging={isDragging}
      item={item}
      listeners={listeners}
      ref={setNodeRef}
      style={style}
    />
  )
}

const KanbanItemCard = React.forwardRef<
  HTMLElement,
  {
    attributes?: React.HTMLAttributes<HTMLElement>
    dragging?: boolean
    item: KanbanItemData
    listeners?: DraggableSyntheticListeners
    overlay?: boolean
    style?: React.CSSProperties
  }
>(function KanbanItemCard(
  { attributes, dragging = false, item, listeners, overlay = false, style },
  ref
) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-3 text-card-foreground shadow-xs transition-colors",
        dragging && !overlay && "border-foreground/40 border-2",
        overlay && "border-foreground/40 border-2"
      )}
      data-dragging={dragging ? "" : undefined}
      data-slot="kanban-item"
      data-value={item.value}
      ref={ref}
      style={style}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 shrink-0 cursor-grab rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring data-dragging:cursor-grabbing"
          data-slot="kanban-item-handle"
          type="button"
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
          <span className="sr-only">Drag item</span>
        </button>
        <div className="min-w-0 flex-1">{item.content}</div>
      </div>
    </article>
  )
})

function KanbanColumn({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function KanbanItem({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export { Kanban, KanbanColumn, KanbanItem }
export { moveKanbanItem, columnDndId, itemDndId }
