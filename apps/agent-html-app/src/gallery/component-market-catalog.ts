import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { deriveMarketComponents } from "@/agent-html/schema/derive"

export const galleryComponentMarketCatalog = deriveMarketComponents(
  agentHtmlComponentRegistry
)
