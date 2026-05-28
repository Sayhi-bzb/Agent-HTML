import {
  type AppThemePresetId,
} from "@/app/shared/app-theme/tokens"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu"
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
  ChevronRightIcon,
  PackageIcon,
  PawPrintIcon,
} from "lucide-react"

type AppThemePresetNavItem = {
  id: AppThemePresetId
  label: string
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
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="group/trigger data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              type="button"
            >
              <span>theme</span>
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/trigger:rotate-90" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
            side="bottom"
            sideOffset={6}
          >
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                onSelectPreset(value as AppThemePresetId)
              }
              value={activePresetId}
            >
              {presets.map((preset) => (
                <DropdownMenuRadioItem key={preset.id} value={preset.id}>
                  <span className="min-w-0 truncate">{preset.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {galleryThemeEditorSections.map((section) => {
        const Icon = section.icon
        const isActive = section.id === activeSectionId

        return (
          <SidebarMenuItem key={section.id}>
            <SidebarMenuButton
              isActive={isActive}
              onClick={() => onSelectSection(section.id)}
              type="button"
            >
              <Icon className="size-4" />
              <span className="min-w-0 flex-1 truncate">{section.label}</span>
              {isActive ? (
                <CheckIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-sidebar-foreground/60"
                />
              ) : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
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
