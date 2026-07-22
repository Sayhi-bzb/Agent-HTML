import {
  BookOpenTextIcon,
  LanguagesIcon,
  MessageSquareTextIcon,
  MoonIcon,
  PaletteIcon,
  SearchIcon,
  SwatchBookIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#agent-html-playground/components/ui/dropdown-menu"
import { AgentHtmlGhostIcon } from "../../shared/brand-icons"
import { GithubMarkIcon } from "../ui/brand-icons"
import { HostDropdownContent, HostDropdownItem } from "../ui/dropdown"
import { HostIconButton } from "../ui/icon-button"
import { HostItemContent } from "../ui/item-content"
import type {
  CanvasHostLanguage,
  CanvasHostThemeMode,
} from "../preferences/canvas-host-preferences"
import type { CanvasThemePresetId } from "#agent-html-playground/theme/presets"

export function HostAgentMenu({
  activeLanguage,
  activeThemePresetId,
  activeThreadLabel,
  activeThemeMode,
  onOpenAppearance,
  onOpenSearch,
  onOpenThreads,
  onSelectLanguage,
  onSelectThemeMode,
  onSelectThemePreset,
  themePresets,
}: {
  activeLanguage: CanvasHostLanguage
  activeThemePresetId: CanvasThemePresetId
  activeThreadLabel: string | null
  activeThemeMode: CanvasHostThemeMode
  onOpenAppearance: () => void
  onOpenSearch: () => void
  onOpenThreads: () => void
  onSelectLanguage: (language: CanvasHostLanguage) => void
  onSelectThemeMode: (mode: CanvasHostThemeMode) => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  themePresets: readonly { id: CanvasThemePresetId; label: string }[]
}) {
  const activeThemePreset = themePresets.find(
    (preset) => preset.id === activeThemePresetId
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <HostIconButton
          icon={AgentHtmlGhostIcon}
          label="Agent menu"
          placement="toolbar"
          size="icon-sm"
          variant="ghost"
        />
      </DropdownMenuTrigger>
      <HostDropdownContent align="start" aria-label="Agent menu" sideOffset={6}>
        <DropdownMenuGroup>
          <HostDropdownItem
            aria-keyshortcuts="Meta+K Control+K"
            icon={SearchIcon}
            label="Search"
            onSelect={onOpenSearch}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <HostDropdownItem
            icon={MessageSquareTextIcon}
            label={activeThreadLabel ?? "New thread"}
            onSelect={onOpenThreads}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <HostDropdownItem
            icon={PaletteIcon}
            label="Appearance"
            onSelect={onOpenAppearance}
          />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="canvas-host-dropdown-item">
              <HostItemContent
                caption={activeThemePreset?.label ?? activeThemePresetId}
                icon={SwatchBookIcon}
                label="Preset"
                layout="inline"
              />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="canvas-host-floating-content canvas-host-dropdown-content">
              <DropdownMenuRadioGroup
                onValueChange={(presetId) =>
                  onSelectThemePreset(presetId as CanvasThemePresetId)
                }
                value={activeThemePresetId}
              >
                {themePresets.map((preset) => (
                  <DropdownMenuRadioItem
                    className="canvas-host-dropdown-item"
                    key={preset.id}
                    value={preset.id}
                  >
                    <span>{preset.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="canvas-host-dropdown-item">
              <HostItemContent icon={MoonIcon} label="Theme" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="canvas-host-floating-content canvas-host-dropdown-content">
              <DropdownMenuRadioGroup
                onValueChange={(mode) =>
                  onSelectThemeMode(mode as CanvasHostThemeMode)
                }
                value={activeThemeMode}
              >
                {(["system", "light", "dark"] as const).map((mode) => (
                  <DropdownMenuRadioItem
                    className="canvas-host-dropdown-item"
                    key={mode}
                    value={mode}
                  >
                    <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="canvas-host-dropdown-item">
              <HostItemContent icon={LanguagesIcon} label="Language" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="canvas-host-floating-content canvas-host-dropdown-content">
              <DropdownMenuRadioGroup
                onValueChange={(language) =>
                  onSelectLanguage(language as CanvasHostLanguage)
                }
                value={activeLanguage}
              >
                {(
                  [
                    ["system", "System"],
                    ["zh", "中文"],
                    ["en", "English"],
                  ] as const
                ).map(([language, label]) => (
                  <DropdownMenuRadioItem
                    className="canvas-host-dropdown-item"
                    key={language}
                    value={language}
                  >
                    <span>{label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem asChild className="canvas-host-dropdown-item">
            <a
              href="https://agent-html.org/docs"
              rel="noreferrer"
              target="_blank"
            >
              <HostItemContent icon={BookOpenTextIcon} label="Documentation" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="canvas-host-dropdown-item">
            <a
              href="https://github.com/Sayhi-bzb/Agent-HTML"
              rel="noreferrer"
              target="_blank"
            >
              <HostItemContent icon={GithubMarkIcon} label="GitHub" />
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </HostDropdownContent>
    </DropdownMenu>
  )
}
