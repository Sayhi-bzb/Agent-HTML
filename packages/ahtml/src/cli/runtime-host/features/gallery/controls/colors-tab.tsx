import { Search, X } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"

import { getThemeTokenControlLabel, pickThemeTokens } from "../helpers"
import {
  GalleryPanelBody,
  TokenEditor,
} from "../shared/form-controls"
import type { GalleryColorsTabProps } from "./types"

export function GalleryColorsTab({
  colorSearch,
  colorSectionValues,
  colorThemeSyncEnabled,
  copyThemeTokens,
  editorState,
  filteredColorTokenSections,
  focusedToken,
  previewThemeMode,
  setColorSearch,
  setColorSectionValues,
  setColorThemeSyncEnabled,
  updateThemeTokenValue,
}: GalleryColorsTabProps) {
  const filteredControlCount = filteredColorTokenSections.reduce(
    (count, section) => count + section.tokenNames.length,
    0,
  )

  return (
    <TabsContent className="ahtml-gallery-tab-panel" value="colors">
      <div className="ahtml-gallery-control-filter-bar">
        <div className="ahtml-gallery-control-filter-field">
          <Search
            aria-hidden="true"
            className="ahtml-gallery-control-filter-icon"
          />
          <Input
            aria-label="Search theme tokens"
            className="ahtml-gallery-control-filter-input ahtml-gallery-control-input-mono"
            onChange={(event) => setColorSearch(event.target.value)}
            placeholder="Search color groups or controls..."
            value={colorSearch}
          />
          {colorSearch ? (
            <Button
              className="ahtml-gallery-control-filter-clear"
              onClick={() => setColorSearch("")}
              size="sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <div className="ahtml-gallery-control-filter-meta">
          <span>
            {filteredControlCount} control{filteredControlCount === 1 ? "" : "s"}
          </span>
          <div className="ahtml-gallery-control-filter-actions">
            <Button
              className="ahtml-gallery-filter-pill"
              onClick={() => setColorThemeSyncEnabled((current) => !current)}
              size="sm"
              type="button"
              variant={colorThemeSyncEnabled ? "secondary" : "ghost"}
            >
              {colorThemeSyncEnabled ? "Theme sync on" : "Theme sync"}
            </Button>
            <Button
              className="ahtml-gallery-filter-pill"
              onClick={() =>
                copyThemeTokens(
                  previewThemeMode,
                  previewThemeMode === "light" ? "dark" : "light",
                )
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              {previewThemeMode === "light"
                ? "Copy light to dark"
                : "Copy dark to light"}
            </Button>
            <Badge variant="outline">{previewThemeMode}</Badge>
          </div>
        </div>
      </div>
      {filteredColorTokenSections.length > 0 ? (
        <Accordion
          className="ahtml-gallery-control-sections"
          onValueChange={setColorSectionValues}
          type="multiple"
          value={colorSectionValues}
        >
          {filteredColorTokenSections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>
                <GalleryPanelBody>
                  <p className="ahtml-gallery-section-note">
                    {section.description}
                  </p>
                  <TokenEditor
                    focusedToken={
                      focusedToken?.mode === previewThemeMode
                        ? focusedToken.tokenName
                        : null
                    }
                    labels={Object.fromEntries(
                      section.tokenNames.map((tokenName) => [
                        tokenName,
                        getThemeTokenControlLabel(tokenName),
                      ]),
                    )}
                    onChange={updateThemeTokenValue}
                    tokens={pickThemeTokens(
                      editorState.draftProfile.globalStyle.tokenSets[
                        previewThemeMode
                      ],
                      section.tokenNames,
                    )}
                  />
                </GalleryPanelBody>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="ahtml-gallery-control-empty">
          No color controls match the current search.
        </div>
      )}
    </TabsContent>
  )
}
