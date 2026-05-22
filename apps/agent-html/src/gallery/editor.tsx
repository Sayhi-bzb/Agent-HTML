import * as React from "react"
import colors from "tailwindcss/colors"
import { ChevronRightIcon } from "lucide-react"

import {
  galleryColorFamilies,
  galleryColorRoleGroups,
  galleryColorSteps,
  galleryColorTokenDefaults,
  type GalleryColorFamily,
  type GalleryColorStep,
  type GalleryColorTokenName,
  type GalleryColorTokenValue,
} from "@/gallery/editor-panels"
import type { GalleryEditorMode } from "@/gallery/types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type TailwindColorScale = Record<GalleryColorStep, string>
const radiusOptions = [
  "0.25rem",
  "0.375rem",
  "0.5rem",
  "0.625rem",
  "0.75rem",
  "1rem",
  "1.25rem",
] as const
type GalleryRadiusValue = (typeof radiusOptions)[number]

const tailwindColorFamilies = Object.fromEntries(
  galleryColorFamilies.map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<GalleryColorFamily, TailwindColorScale>

function getTokenColorValue({
  family,
  step,
}: GalleryColorTokenValue) {
  return tailwindColorFamilies[family]?.[step] ?? tailwindColorFamilies.zinc[500]
}

function GalleryColorTokenItem({
  token,
  value,
  onValueChange,
}: {
  token: GalleryColorTokenName
  value: GalleryColorTokenValue
  onValueChange: (value: GalleryColorTokenValue) => void
}) {
  const swatchColor = getTokenColorValue(value)

  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            className="h-auto min-h-8 items-start py-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            size="sm"
            type="button"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span>{token}</span>
              <span className="text-xs text-sidebar-foreground/45">
                {value.family} / {value.step}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="mt-0.5 size-3 shrink-0 rounded-full ring-1 ring-sidebar-border"
              style={{ backgroundColor: swatchColor }}
            />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-56 p-3"
          side="right"
          sideOffset={10}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Family
              </p>
              <Select
                onValueChange={(family) =>
                  onValueChange({
                    ...value,
                    family: family as GalleryColorFamily,
                  })
                }
                value={value.family}
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {galleryColorFamilies.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">Step</p>
              <Select
                onValueChange={(step) =>
                  onValueChange({
                    ...value,
                    step: step as GalleryColorStep,
                  })
                }
                value={value.step}
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {galleryColorSteps.map((step) => (
                      <SelectItem key={step} value={step}>
                        {step}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  )
}

function GalleryRadiusEditorPanel({
  value,
  onValueChange,
}: {
  value: GalleryRadiusValue
  onValueChange: (value: GalleryRadiusValue) => void
}) {
  return (
    <div className="flex flex-1 flex-col px-2 py-2">
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>Role groups</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton
                    className="h-auto min-h-8 items-start py-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    size="sm"
                    type="button"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span>radius</span>
                      <span className="text-xs text-sidebar-foreground/45">
                        {value}
                      </span>
                    </span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-56 p-2"
                  side="right"
                  sideOffset={10}
                >
                  <SidebarMenu className="gap-0.5">
                    {radiusOptions.map((radius) => (
                      <SidebarMenuItem key={radius}>
                        <SidebarMenuButton
                          className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          isActive={radius === value}
                          onClick={() => onValueChange(radius)}
                          size="sm"
                          type="button"
                        >
                          <span>{radius}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </PopoverContent>
              </Popover>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <span>base</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}

export function GalleryEditorPanel({
  mode,
  onRadiusChange,
  radiusValue,
}: {
  mode: GalleryEditorMode
  onRadiusChange: (value: GalleryRadiusValue) => void
  radiusValue: GalleryRadiusValue
}) {
  const [tokenValues, setTokenValues] = React.useState(galleryColorTokenDefaults)

  if (mode !== "color") {
    return (
      <GalleryRadiusEditorPanel
        onValueChange={onRadiusChange}
        value={radiusValue}
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-2 py-2">
      {galleryColorRoleGroups.map((group, index) => (
        <Collapsible
          key={group.id}
          className="group/collapsible"
          defaultOpen={index === 0}
        >
          <SidebarGroup className="px-0">
            <SidebarGroupLabel
              asChild
              className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                {group.label}
                <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.tokens.map((token) => (
                    <GalleryColorTokenItem
                      key={token}
                      onValueChange={(value) =>
                        setTokenValues((current) => ({
                          ...current,
                          [token]: value,
                        }))
                      }
                      token={token}
                      value={tokenValues[token]}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </div>
  )
}

export { radiusOptions, type GalleryRadiusValue }
