import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { TabsContent } from "@/components/ui/tabs"

import {
  GalleryPanelBody,
  LabeledInput,
  SliderInputField,
} from "../shared/form-controls"
import type { GalleryOtherTabProps } from "./types"

type ShadowTypographyField =
  | "shadowBlur"
  | "shadowSpread"
  | "shadowOffsetX"
  | "shadowOffsetY"

const shadowFieldControls: ReadonlyArray<{
  field: ShadowTypographyField
  label: string
  min: number
  max: number
  step: number
}> = [
  { field: "shadowBlur", label: "Shadow Blur", min: 0, max: 50, step: 0.5 },
  {
    field: "shadowSpread",
    label: "Shadow Spread",
    min: -50,
    max: 50,
    step: 0.5,
  },
  {
    field: "shadowOffsetX",
    label: "Shadow Offset X",
    min: -50,
    max: 50,
    step: 0.5,
  },
  {
    field: "shadowOffsetY",
    label: "Shadow Offset Y",
    min: -50,
    max: 50,
    step: 0.5,
  },
]

export function GalleryOtherTab({
  editorState,
  focusedEditorField,
  updateDraftProfile,
}: GalleryOtherTabProps) {
  return (
    <TabsContent className="ahtml-gallery-tab-panel" value="other">
      <Accordion
        className="ahtml-gallery-control-sections"
        defaultValue={["geometry", "spacing", "shadow", "component-treatments"]}
        type="multiple"
      >
        <AccordionItem value="geometry">
          <AccordionTrigger>Radius</AccordionTrigger>
          <AccordionContent>
            <GalleryPanelBody>
              <SliderInputField
                description="Shared radius token applied across card, input, and popover surfaces."
                focused={focusedEditorField === "radiusBase"}
                label="Radius Base"
                max={2}
                min={0}
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      radiusScale: {
                        ...draft.globalStyle.radiusScale,
                        base: `${value
                          .toFixed(3)
                          .replace(/0+$/, "")
                          .replace(/\.$/, "")}rem`,
                      },
                    },
                  }))
                }
                step={0.025}
                unit="rem"
                value={parseFloat(
                  editorState.draftProfile.globalStyle.radiusScale.base,
                )}
              />
            </GalleryPanelBody>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="spacing">
          <AccordionTrigger>Spacing</AccordionTrigger>
          <AccordionContent>
            <GalleryPanelBody>
              <SliderInputField
                description="Global spacing step used to tighten or relax editor rhythm."
                focused={focusedEditorField === "spacing"}
                label="Spacing"
                max={0.35}
                min={0.15}
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        spacing: `${value.toFixed(2)}rem`,
                      },
                    },
                  }))
                }
                step={0.01}
                unit="rem"
                value={parseFloat(
                  editorState.draftProfile.globalStyle.typography.spacing,
                )}
              />
            </GalleryPanelBody>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shadow">
          <AccordionTrigger>Shadow</AccordionTrigger>
          <AccordionContent>
            <GalleryPanelBody>
              <LabeledInput
                description="Base shadow color for elevated preview surfaces."
                label="Shadow Color"
                mono
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        shadowColor: value,
                      },
                    },
                  }))
                }
                value={editorState.draftProfile.globalStyle.typography.shadowColor}
              />
              <SliderInputField
                description="Opacity applied to the shared preview shadow."
                focused={focusedEditorField === "shadow"}
                label="Shadow Opacity"
                max={1}
                min={0}
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        shadowOpacity: value.toFixed(2),
                      },
                    },
                  }))
                }
                step={0.01}
                unit=""
                value={parseFloat(
                  editorState.draftProfile.globalStyle.typography.shadowOpacity,
                )}
              />
              <div className="ahtml-gallery-shadow-grid">
                {shadowFieldControls.map(
                  ({ field: shadowField, label, min, max, step }) => (
                    <SliderInputField
                      key={shadowField}
                      label={label}
                      max={max}
                      min={min}
                      onChange={(value) =>
                        updateDraftProfile((draft) => ({
                          ...draft,
                          globalStyle: {
                            ...draft.globalStyle,
                            typography: {
                              ...draft.globalStyle.typography,
                              [shadowField]: `${value}px`,
                            },
                          },
                        }))
                      }
                      step={step}
                      unit="px"
                      value={parseFloat(
                        editorState.draftProfile.globalStyle.typography[
                          shadowField
                        ].replace("px", ""),
                      )}
                    />
                  ),
                )}
              </div>
            </GalleryPanelBody>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="component-treatments">
          <AccordionTrigger>Treatments</AccordionTrigger>
          <AccordionContent>
            <GalleryPanelBody>
              {Object.entries(editorState.draftProfile.componentStyle.treatments)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([componentName, treatment]) => (
                  <LabeledInput
                    description="Treatment alias applied when the renderer maps this component into the gallery shell."
                    key={componentName}
                    label={componentName}
                    mono
                    onChange={(value) =>
                      updateDraftProfile((draft) => ({
                        ...draft,
                        componentStyle: {
                          ...draft.componentStyle,
                          treatments: {
                            ...draft.componentStyle.treatments,
                            [componentName]: value,
                          },
                        },
                      }))
                    }
                    value={treatment}
                  />
                ))}
            </GalleryPanelBody>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TabsContent>
  )
}
