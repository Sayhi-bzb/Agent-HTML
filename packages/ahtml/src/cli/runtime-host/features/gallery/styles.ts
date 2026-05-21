import { createGalleryWorkbenchBaseCss } from "./styles/base"
import { createGalleryCardsWorkbenchCss } from "./styles/cards"
import { createGalleryColorsWorkbenchCss } from "./styles/colors"
import { createGalleryCustomWorkbenchCss } from "./styles/custom"
import { createGalleryDashboardWorkbenchCss } from "./styles/dashboard"
import { createGalleryMailWorkbenchCss } from "./styles/mail"
import { createGalleryPricingWorkbenchCss } from "./styles/pricing"
import { createGalleryWorkbenchResponsiveCss } from "./styles/responsive"
import { createGalleryTypographyWorkbenchCss } from "./styles/typography"

export function createGalleryWorkbenchCss() {
  return [
    createGalleryWorkbenchBaseCss(),
    createGalleryCustomWorkbenchCss(),
    createGalleryCardsWorkbenchCss(),
    createGalleryColorsWorkbenchCss(),
    createGalleryTypographyWorkbenchCss(),
    createGalleryDashboardWorkbenchCss(),
    createGalleryMailWorkbenchCss(),
    createGalleryPricingWorkbenchCss(),
    createGalleryWorkbenchResponsiveCss(),
  ].join("\n")
}
