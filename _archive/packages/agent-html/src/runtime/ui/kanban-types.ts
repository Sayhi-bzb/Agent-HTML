import type * as React from "react"

export type KanbanColumnData = {
  value: string
  title: string
  items: KanbanItemData[]
}

export type KanbanItemData = {
  value: string
  content: React.ReactNode
}

export type KanbanColumnElement = React.ReactElement<{
  value?: string
  title?: string
  children?: React.ReactNode
}>

export type KanbanItemElement = React.ReactElement<{
  value?: string
  children?: React.ReactNode
}>
