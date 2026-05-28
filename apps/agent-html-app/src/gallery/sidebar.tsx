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
import type { GalleryViewId } from "@/app/gallery/views"
import {
  galleryThemeEditorSections,
  type GalleryThemeEditorSectionId,
} from "@/app/gallery/theme-editor-sections"
import {
  CheckIcon,
  PackageIcon,
  PawPrintIcon,
} from "lucide-react"

type AppThemePresetNavItem = {
  id: AppThemePresetId
  label: string
}

const galleryThemeSidebarSelectTriggerClassName =
  "h-8 w-full gap-2 border-transparent bg-sidebar px-2 py-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

const galleryThemeSidebarSelectContentClassName =
  "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] p-1"

const galleryThemeSidebarSelectItemClassName =
  "gap-2 px-2 py-1 pr-8 text-sm"

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
    <div className="flex flex-col gap-1 px-2">
      <Select
        onValueChange={(value) => onSelectPreset(value as AppThemePresetId)}
        value={activePresetId}
      >
        <SelectTrigger
          aria-label="Theme preset"
          className={galleryThemeSidebarSelectTriggerClassName}
        >
          <SelectValue placeholder="Theme">
            <span className="min-w-0 truncate">
              {activePreset?.label ?? "Theme"}
            </span>
          </SelectValue>
        </SelectTrigger>
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
        <SelectTrigger
          aria-label="Theme editor section"
          className={galleryThemeSidebarSelectTriggerClassName}
        >
          <SelectValue placeholder="Section">
            {activeSection ? (
              <span className="flex min-w-0 items-center gap-2">
                <activeSection.icon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
                <span className="truncate">{activeSection.label}</span>
              </span>
            ) : (
              <span className="min-w-0 truncate">Section</span>
            )}
          </SelectValue>
        </SelectTrigger>
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
  viewId,
}: {
  viewId: Exclude<GalleryViewId, "theme">
}) {
  const copy =
    viewId === "components"
      ? {
          icon: PackageIcon,
          label: "Component Market",
          summary: "Browse component packs once market data is connected.",
          sections: ["Browse", "Installed", "Filters"],
        }
      : {
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
