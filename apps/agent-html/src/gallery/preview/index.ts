import { BudgetTableCard } from "@/gallery/preview/cards/budget-table-card"
import { ControlsShowcaseCard } from "@/gallery/preview/cards/controls-showcase-card"
import { DraftStatusTableCard } from "@/gallery/preview/cards/draft-status-table-card"
import { FieldShowcaseCard } from "@/gallery/preview/cards/field-showcase-card"
import { PerformanceChartCard } from "@/gallery/preview/cards/performance-chart-card"
import { SourceShareCard } from "@/gallery/preview/cards/source-share-card"
import { SurfaceShowcaseCard } from "@/gallery/preview/cards/surface-showcase-card"

export const galleryPreviewCards = [
  PerformanceChartCard,
  ControlsShowcaseCard,
  SourceShareCard,
  DraftStatusTableCard,
  FieldShowcaseCard,
  BudgetTableCard,
  SurfaceShowcaseCard,
] as const
