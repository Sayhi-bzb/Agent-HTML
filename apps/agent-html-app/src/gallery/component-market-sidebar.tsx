import * as React from "react"
import {
  CheckIcon,
  CircleIcon,
  DatabaseIcon,
  FileTextIcon,
  GalleryVerticalEndIcon,
  GaugeIcon,
  PackageIcon,
  SearchIcon,
} from "lucide-react"

import {
  type EnabledGalleryComponentTags,
  galleryComponentMarketAllCategory,
  galleryComponentMarketCatalog,
  galleryComponentMarketCategoryLabels,
  getGalleryComponentMarketCategoryCounts,
  getGalleryComponentMarketInstalledCount,
  matchesGalleryComponentMarketSearch,
  type GalleryComponentMarketFilters,
} from "@/app/gallery/component-market-catalog"
import {
  buildEnabledAgentHtmlPromptSchema,
  estimatePromptSchemaTokens,
} from "@/app/gallery/component-market-repository"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/shared/ui/command"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import { FooterMenuStack } from "@/app/shell/footer-menu-stack"

export function GalleryComponentMarketSidebarHeader({
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
  const [open, setOpen] = React.useState(false)
  const [dialogSearchQuery, setDialogSearchQuery] = React.useState("")
  const installedCount =
    getGalleryComponentMarketInstalledCount(enabledComponentTags)
  const searchResults = React.useMemo(() => {
    const query = dialogSearchQuery.trim().toLowerCase()

    if (!query) {
      return galleryComponentMarketCatalog
    }

    return galleryComponentMarketCatalog.filter((component) =>
      matchesGalleryComponentMarketSearch(component, query)
    )
  }, [dialogSearchQuery])

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setDialogSearchQuery("")
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => changeOpen(true)} type="button">
            <SearchIcon className="size-4" />
            <span className="min-w-0 flex-1 truncate">Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              onComponentMarketFiltersChange({
                category: galleryComponentMarketAllCategory,
                status: "all",
              })
              onSearchQueryCommit("")
            }}
            type="button"
          >
            <PackageIcon className="size-4" />
            <span className="min-w-0 flex-1 truncate">All components</span>
            <span className="shrink-0 text-xs text-sidebar-foreground/50">
              {galleryComponentMarketCatalog.length}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() =>
              onComponentMarketFiltersChange({
                ...componentMarketFilters,
                status: "installed",
              })
            }
            type="button"
          >
            <CheckIcon className="size-4" />
            <span className="min-w-0 flex-1 truncate">Installed</span>
            <span className="shrink-0 text-xs text-sidebar-foreground/50">
              {installedCount}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <CommandDialog
        className="sm:max-w-md"
        description="Search component market components."
        onOpenChange={changeOpen}
        open={open}
        title="Search components"
      >
        <Command>
          <CommandInput
            onValueChange={setDialogSearchQuery}
            placeholder="Search components..."
            value={dialogSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No components found.</CommandEmpty>
            <CommandGroup heading="Components">
              {searchResults.map((component) => (
                <CommandItem
                  key={component.tag}
                  keywords={[
                    component.tag,
                    component.market.title,
                    component.market.summary,
                    component.market.category,
                  ]}
                  onSelect={() => {
                    onSearchQueryCommit(component.market.title)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {component.market.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {
                      galleryComponentMarketCategoryLabels[
                        component.market.category
                      ]
                    }
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

export function GalleryComponentMarketSidebarFooter({
  enabledComponentTags,
}: {
  enabledComponentTags: EnabledGalleryComponentTags
}) {
  const tokenCount = estimatePromptSchemaTokens(
    buildEnabledAgentHtmlPromptSchema(enabledComponentTags)
  ).tokens

  return (
    <FooterMenuStack>
      <SidebarMenuItem>
        <SidebarMenuButton disabled type="button">
          <GaugeIcon className="size-4" />
          <span className="min-w-0 flex-1 truncate">Tokens</span>
          <span className="shrink-0 text-xs text-sidebar-foreground">
            {tokenCount.toLocaleString()}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </FooterMenuStack>
  )
}

export function GalleryComponentMarketSidebar({
  filters,
  onFiltersChange,
}: {
  filters: GalleryComponentMarketFilters
  onFiltersChange: (filters: GalleryComponentMarketFilters) => void
}) {
  const categoryCounts = getGalleryComponentMarketCategoryCounts()
  const groups = [
    {
      label: "Categories",
      items: [
        {
          icon: GalleryVerticalEndIcon,
          label: "Layout",
          meta: String(categoryCounts.layout ?? 0),
          onClick: () => onFiltersChange({ ...filters, category: "layout" }),
        },
        {
          icon: FileTextIcon,
          label: "Content",
          meta: String(categoryCounts.content ?? 0),
          onClick: () => onFiltersChange({ ...filters, category: "content" }),
        },
        {
          icon: DatabaseIcon,
          label: "Data",
          meta: String(categoryCounts.data ?? 0),
          onClick: () => onFiltersChange({ ...filters, category: "data" }),
        },
        {
          icon: CircleIcon,
          label: "Feedback",
          meta: String(categoryCounts.feedback ?? 0),
          onClick: () => onFiltersChange({ ...filters, category: "feedback" }),
        },
        {
          icon: PackageIcon,
          label: "Media and form",
          meta: String(
            (categoryCounts.media ?? 0) + (categoryCounts.form ?? 0)
          ),
          onClick: () => onFiltersChange({ ...filters, category: "media" }),
        },
      ],
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-3 px-2 py-2">
      {groups.map((group) => (
        <SidebarGroup className="px-0" key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton onClick={item.onClick} type="button">
                      <Icon className="size-4" />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      <span className="shrink-0 text-xs text-sidebar-foreground/50">
                        {item.meta}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}
