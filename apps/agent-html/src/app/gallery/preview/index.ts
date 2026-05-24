import { AccordionShowcase } from "@/app/gallery/preview/cards/accordion-showcase"
import { AlertShowcase } from "@/app/gallery/preview/cards/alert-showcase"
import { AspectRatioShowcase } from "@/app/gallery/preview/cards/aspect-ratio-showcase"
import { BadgeShowcase } from "@/app/gallery/preview/cards/badge-showcase"
import { CardShowcase } from "@/app/gallery/preview/cards/card-showcase"
import { CarouselShowcase } from "@/app/gallery/preview/cards/carousel-showcase"
import { ChartShowcase } from "@/app/gallery/preview/cards/chart-showcase"
import { ProgressShowcase } from "@/app/gallery/preview/cards/progress-showcase"
import { SeparatorShowcase } from "@/app/gallery/preview/cards/separator-showcase"
import { TableShowcase } from "@/app/gallery/preview/cards/table-showcase"
import { TabsShowcase } from "@/app/gallery/preview/cards/tabs-showcase"

export const galleryPreviewCards = [
  AccordionShowcase,
  AlertShowcase,
  AspectRatioShowcase,
  BadgeShowcase,
  CardShowcase,
  CarouselShowcase,
  ChartShowcase,
  ProgressShowcase,
  SeparatorShowcase,
  TableShowcase,
  TabsShowcase,
] as const
