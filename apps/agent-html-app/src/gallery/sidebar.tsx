import * as React from "react"

import {
  type AppThemePresetId,
} from "@/app/shared/app-theme/tokens"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/ui/select"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import { FooterMenuStack } from "@/app/shell/footer-menu-stack"
import {
  type EnabledGalleryComponentTags,
  type GalleryComponentMarketFilters,
} from "@/app/gallery/component-market-catalog"
import type { GalleryViewId } from "@/app/gallery/views"
import {
  galleryThemeEditorSections,
  type GalleryThemeEditorSectionId,
} from "@/app/gallery/theme-editor-sections"
import {
  CheckIcon,
  ChevronDownIcon,
  PawPrintIcon,
} from "lucide-react"

const GalleryComponentMarketSidebar = React.lazy(() =>
  import("@/app/gallery/component-market-sidebar").then((module) => ({
    default: module.GalleryComponentMarketSidebar,
  }))
)

const GalleryComponentMarketSidebarFooter = React.lazy(() =>
  import("@/app/gallery/component-market-sidebar").then((module) => ({
    default: module.GalleryComponentMarketSidebarFooter,
  }))
)

const GalleryComponentMarketSidebarHeader = React.lazy(() =>
  import("@/app/gallery/component-market-sidebar").then((module) => ({
    default: module.GalleryComponentMarketSidebarHeader,
  }))
)

type AppThemePresetNavItem = {
  id: AppThemePresetId
  label: string
}

const galleryThemeSidebarSelectContentClassName =
  "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] p-1"

const galleryThemeSidebarSelectItemClassName =
  "gap-2 px-2 py-1 pr-8 text-sm"

const galleryThemeSidebarSelectMenuButtonClassName =
  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"

function GalleryLazySidebarFallback() {
  return <div className="min-h-20" />
}

export function GalleryLazyComponentMarketSidebarHeader({
  componentMarketFilters,
  enabledComponentTags,
  onComponentMarketFiltersChange,
  onSearchQueryCommit,
}: {
  componentMarketFilters: GalleryComponentMarketFilters
  enabledComponentTags: EnabledGalleryComponentTags
  onComponentMarketFiltersChange: (filters: GalleryComponentMarketFilters) => void
  onSearchQueryCommit: (query: string) => void
}) {
  return (
    <React.Suspense fallback={<GalleryLazySidebarFallback />}>
      <GalleryComponentMarketSidebarHeader
        componentMarketFilters={componentMarketFilters}
        enabledComponentTags={enabledComponentTags}
        onComponentMarketFiltersChange={onComponentMarketFiltersChange}
        onSearchQueryCommit={onSearchQueryCommit}
      />
    </React.Suspense>
  )
}

export function GalleryLazyComponentMarketSidebarFooter({
  enabledComponentTags,
}: {
  enabledComponentTags: EnabledGalleryComponentTags
}) {
  return (
    <React.Suspense fallback={null}>
      <GalleryComponentMarketSidebarFooter
        enabledComponentTags={enabledComponentTags}
      />
    </React.Suspense>
  )
}

export function GalleryThemeSidebarHeader({
  activePresetId,
  activeSectionId,
  onSelectSection,
  onSelectPreset,
  presets,
}: {
  activePresetId: AppThemePresetId
  activeSectionId: GalleryThemeEditorSectionId
  onSelectSection: (sectionId: GalleryThemeEditorSectionId) => void
  onSelectPreset: (presetId: AppThemePresetId) => void
  presets: readonly AppThemePresetNavItem[]
}) {
  const activePreset = presets.find((preset) => preset.id === activePresetId)
  const activeSection = galleryThemeEditorSections.find(
    (section) => section.id === activeSectionId
  )

  return (
    <div className="flex flex-col gap-1">
      <Select
        onValueChange={(value) => onSelectPreset(value as AppThemePresetId)}
        value={activePresetId}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SelectTrigger asChild>
              <SidebarMenuButton
                aria-label="Theme preset"
                className={galleryThemeSidebarSelectMenuButtonClassName}
                type="button"
              >
                <SelectValue placeholder="Theme">
                  <span className="min-w-0 flex-1 truncate text-left">
                    {activePreset?.label ?? "Theme"}
                  </span>
                </SelectValue>
                <ChevronDownIcon className="ml-auto size-4 shrink-0 text-sidebar-foreground/60" />
              </SidebarMenuButton>
            </SelectTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
        <SelectContent
          align="start"
          className={galleryThemeSidebarSelectContentClassName}
          position="popper"
        >
          {presets.map((preset) => (
            <SelectItem
              className={galleryThemeSidebarSelectItemClassName}
              key={preset.id}
              value={preset.id}
            >
              <span className="min-w-0 truncate">{preset.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          onSelectSection(value as GalleryThemeEditorSectionId)
        }
        value={activeSectionId}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SelectTrigger asChild>
              <SidebarMenuButton
                aria-label="Theme editor section"
                className={galleryThemeSidebarSelectMenuButtonClassName}
                type="button"
              >
                <SelectValue placeholder="Section">
                  {activeSection ? (
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      <activeSection.icon
                        aria-hidden="true"
                        className="size-4 shrink-0"
                      />
                      <span className="truncate">{activeSection.label}</span>
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-left">
                      Section
                    </span>
                  )}
                </SelectValue>
                <ChevronDownIcon className="ml-auto size-4 shrink-0 text-sidebar-foreground/60" />
              </SidebarMenuButton>
            </SelectTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
        <SelectContent
          align="start"
          className={galleryThemeSidebarSelectContentClassName}
          position="popper"
        >
          {galleryThemeEditorSections.map((section) => {
            const Icon = section.icon

            return (
              <SelectItem
                className={galleryThemeSidebarSelectItemClassName}
                key={section.id}
                value={section.id}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{section.label}</span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export function GalleryThemeSidebarFooter({
  isDirty,
  onApply,
}: {
  isDirty: boolean
  onApply: () => void
}) {
  return (
    <FooterMenuStack>
      <SidebarMenuItem>
        <SidebarMenuButton disabled={!isDirty} onClick={onApply} type="button">
          <CheckIcon className="size-4" />
          <span>{isDirty ? "Apply" : "Applied"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </FooterMenuStack>
  )
}

export function GalleryMarketSidebar({
  componentMarketFilters,
  onComponentMarketFiltersChange,
  viewId,
}: {
  componentMarketFilters: GalleryComponentMarketFilters
  onComponentMarketFiltersChange: (filters: GalleryComponentMarketFilters) => void
  viewId: Exclude<GalleryViewId, "theme">
}) {
  if (viewId === "components") {
    return (
      <React.Suspense fallback={<GalleryLazySidebarFallback />}>
        <GalleryComponentMarketSidebar
          filters={componentMarketFilters}
          onFiltersChange={onComponentMarketFiltersChange}
        />
      </React.Suspense>
    )
  }

  const copy =
    {
      icon: PawPrintIcon,
      label: "Pet Market",
      summary: "Browse companion assets once pet packages are connected.",
      sections: ["Browse", "Installed", "Preview"],
    }
  const Icon = copy.icon

  return (
    <div className="flex flex-1 flex-col gap-3 px-2 py-2">
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{copy.label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton disabled type="button">
                <Icon className="size-4" />
                <span>{copy.summary}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {copy.sections.map((section) => (
              <SidebarMenuItem key={section}>
                <SidebarMenuButton disabled type="button">
                  <span>{section}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
