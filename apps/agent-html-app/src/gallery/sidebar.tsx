import {
  type AppThemePresetId,
} from "@/app/shared/app-theme/tokens"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  onSelectPreset,
  presets,
}: {
  activePresetId: AppThemePresetId
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
            {presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onSelect={() => onSelectPreset(preset.id)}
              >
                <span>{preset.label}</span>
                {preset.id === activePresetId ? (
                  <CheckIcon className="ml-auto size-4" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton type="button">
          <span>color</span>
          <CheckIcon className="ml-auto size-4" />
        </SidebarMenuButton>
      </SidebarMenuItem>
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
