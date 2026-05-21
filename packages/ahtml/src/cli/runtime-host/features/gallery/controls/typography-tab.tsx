import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { TabsContent } from "@/components/ui/tabs"

import { fontPresetOptions } from "../config"
import {
  FieldRow,
  FontPickerField,
  GalleryPanelBody,
  LabeledInput,
} from "../shared/form-controls"
import type { GalleryTypographyTabProps } from "./types"

export function GalleryTypographyTab({
  editorState,
  focusedEditorField,
  previewThemeMode,
  updateDraftProfile,
}: GalleryTypographyTabProps) {
  return (
    <TabsContent className="ahtml-gallery-tab-panel" value="typography">
      <Accordion
        className="ahtml-gallery-control-sections"
        defaultValue={["fonts"]}
        type="multiple"
      >
        <AccordionItem value="fonts">
          <AccordionTrigger>Font family</AccordionTrigger>
          <AccordionContent>
            <GalleryPanelBody>
              <FontPickerField
                description="Primary UI font for editor and rendered artifact surfaces."
                focused={focusedEditorField === "fontSans"}
                label="Font Sans"
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        fontSans: value,
                      },
                    },
                  }))
                }
                options={fontPresetOptions.sans}
                value={editorState.draftProfile.globalStyle.typography.fontSans}
              />
              <FontPickerField
                description="Display font used for section titles and prominent headings."
                focused={focusedEditorField === "fontHeading"}
                label="Font Heading"
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        fontHeading: value,
                      },
                    },
                  }))
                }
                options={fontPresetOptions.heading}
                value={editorState.draftProfile.globalStyle.typography.fontHeading}
              />
              <FontPickerField
                description="Serif companion used in richer editorial or marketing surfaces."
                focused={focusedEditorField === "fontSerif"}
                label="Font Serif"
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        fontSerif: value,
                      },
                    },
                  }))
                }
                options={fontPresetOptions.serif}
                value={editorState.draftProfile.globalStyle.typography.fontSerif}
              />
              <FontPickerField
                description="Monospace font for token readouts, code, and utility surfaces."
                focused={focusedEditorField === "fontMono"}
                label="Font Mono"
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        fontMono: value,
                      },
                    },
                  }))
                }
                options={fontPresetOptions.mono}
                value={editorState.draftProfile.globalStyle.typography.fontMono}
              />
              <LabeledInput
                description="Global tracking used for denser UI and headline rhythm."
                label="Letter Spacing"
                mono
                onChange={(value) =>
                  updateDraftProfile((draft) => ({
                    ...draft,
                    globalStyle: {
                      ...draft.globalStyle,
                      typography: {
                        ...draft.globalStyle.typography,
                        letterSpacing: value,
                      },
                    },
                  }))
                }
                value={editorState.draftProfile.globalStyle.typography.letterSpacing}
              />
              <FieldRow label="Preview mode" value={previewThemeMode} />
            </GalleryPanelBody>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TabsContent>
  )
}
