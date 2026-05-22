import { BudgetTableCard } from "@/gallery/preview/budget-table-card"
import { DraftStatusTableCard } from "@/gallery/preview/draft-status-table-card"
import { PerformanceChartCard } from "@/gallery/preview/performance-chart-card"
import { SourceShareCard } from "@/gallery/preview/source-share-card"

export const galleryPreviewCards = [
  PerformanceChartCard,
  SourceShareCard,
  DraftStatusTableCard,
  BudgetTableCard,
] as const
