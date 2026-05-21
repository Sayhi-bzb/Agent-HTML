import type { RendererKind } from "./kinds"
import type { UiRenderer, UiRendererContext } from "./ui-renderer-types"
import { createBasicUiRenderers } from "./ui-renderers/basic"
import { createCollectionUiRenderers } from "./ui-renderers/collections"
import { createDisclosureUiRenderers } from "./ui-renderers/disclosure"
import { createFieldUiRenderers } from "./ui-renderers/fields"
import { createOptionUiRenderers } from "./ui-renderers/options"

export function createUiRenderer(context: UiRendererContext) {
  return {
    ...createBasicUiRenderers(context),
    ...createFieldUiRenderers(context),
    ...createOptionUiRenderers(context),
    ...createCollectionUiRenderers(context),
    ...createDisclosureUiRenderers(context),
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}
