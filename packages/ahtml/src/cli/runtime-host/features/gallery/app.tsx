import React from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Copy,
  Inspect,
  Maximize2,
  Minimize2,
  MoreVertical,
  Search,
  Shuffle,
  X,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  assertRendererRegistryParity,
  createRendererSpecMap,
} from "../../renderer/parity"
import { createRendererNode } from "../../renderer/render-node"
import { createGalleryPreviewSections } from "./preview-document.mjs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { AgentDocument, RuntimeVerificationState } from "../../renderer/types"

type ArtifactProfile = AgentDocument["meta"]["artifactProfile"]
type GalleryStateResponse = {
  ok: boolean
  availableArtifactProfileReferences: string[]
  artifactProfileReference: string
  artifactProfile: ArtifactProfile
  availableStyleReferences?: string[]
  styleReference?: string
  styleProfile?: ArtifactProfile
}

type GalleryMutationResponse = {
  ok: boolean
  error?: string
  availableArtifactProfileReferences?: string[]
  artifactProfileReference?: string
  artifactProfile?: ArtifactProfile
  availableStyleReferences?: string[]
  styleReference?: string
}

type GalleryEditorState = {
  availableStyleReferences: string[]
  createId: string
  draftProfile: ArtifactProfile
  error: string
  isDirty: boolean
  isSaving: boolean
  persistedProfile: ArtifactProfile
  status: string
  styleReference: string
}

type GalleryControlTab = "colors" | "typography" | "other" | "profile"
type GalleryPreviewMode =
  | "components"
  | "colors"
  | "custom"
  | "dashboard"
  | "mail"
  | "forms"
  | "pricing"
  | "selection"
  | "disclosure"
  | "typography"
  | "full"
type GalleryPreviewThemeMode = "light" | "dark"
type ThemeTokenName =
  keyof ArtifactProfile["globalStyle"]["tokenSets"]["light"]
type FocusedThemeToken = {
  mode: GalleryPreviewThemeMode
  tokenName: ThemeTokenName
}
type FocusedEditorField =
  | "fontSans"
  | "fontHeading"
  | "fontSerif"
  | "fontMono"
  | "letterSpacing"
  | "spacing"
  | "shadow"
  | "radiusBase"
type FontPickerOption = {
  category: "Heading" | "Mono" | "Sans" | "Serif"
  label: string
  value: string
}
type GalleryInspectorState = {
  classTokens: string[]
  component: string
  label: string
  left: number
  pinned: boolean
  path: string
  renderKind: string
  sourceTokens: string[]
  slot: string
  source: string
  tagName: string
  top: number
  treatment: string
  width: number
  height: number
}

const focusableThemeTokenEntries: Array<[string, ThemeTokenName]> = [
  ["destructive-foreground", "destructiveForeground"],
  ["primary-foreground", "primaryForeground"],
  ["secondary-foreground", "secondaryForeground"],
  ["card-foreground", "cardForeground"],
  ["popover-foreground", "popoverForeground"],
  ["muted-foreground", "mutedForeground"],
  ["accent-foreground", "accentForeground"],
  ["chart-1", "chart1"],
  ["chart-2", "chart2"],
  ["chart-3", "chart3"],
  ["chart-4", "chart4"],
  ["chart-5", "chart5"],
  ["sidebar-primary-foreground", "sidebarPrimaryForeground"],
  ["sidebar-accent-foreground", "sidebarAccentForeground"],
  ["sidebar-foreground", "sidebarForeground"],
  ["sidebar-primary", "sidebarPrimary"],
  ["sidebar-accent", "sidebarAccent"],
  ["sidebar-border", "sidebarBorder"],
  ["sidebar-ring", "sidebarRing"],
  ["sidebar", "sidebar"],
  ["background", "background"],
  ["foreground", "foreground"],
  ["destructive", "destructive"],
  ["secondary", "secondary"],
  ["primary", "primary"],
  ["popover", "popover"],
  ["accent", "accent"],
  ["border", "border"],
  ["input", "input"],
  ["muted", "muted"],
  ["card", "card"],
  ["ring", "ring"],
]
const colorTokenSections: Array<{
  description: string
  id: string
  title: string
  tokenNames: ThemeTokenName[]
}> = [
  {
    description: "Primary action colors for filled emphasis surfaces.",
    id: "primary-colors",
    title: "Primary",
    tokenNames: ["primary", "primaryForeground"],
  },
  {
    description: "Secondary action colors for quieter filled surfaces.",
    id: "secondary-colors",
    title: "Secondary",
    tokenNames: ["secondary", "secondaryForeground"],
  },
  {
    description: "Accent colors for selection, hover, and focus-adjacent emphasis.",
    id: "accent-colors",
    title: "Accent",
    tokenNames: ["accent", "accentForeground"],
  },
  {
    description: "Canvas and copy colors that establish overall contrast.",
    id: "base-colors",
    title: "Base",
    tokenNames: ["background", "foreground"],
  },
  {
    description: "Card surface pair for nested preview shells and content panels.",
    id: "card-colors",
    title: "Card",
    tokenNames: ["card", "cardForeground"],
  },
  {
    description: "Popover surface pair for menus, pickers, and floating editors.",
    id: "popover-colors",
    title: "Popover",
    tokenNames: [
      "popover",
      "popoverForeground",
    ],
  },
  {
    description: "Muted background and text used for low-priority surfaces and captions.",
    id: "muted-colors",
    title: "Muted",
    tokenNames: ["muted", "mutedForeground"],
  },
  {
    description: "Destructive colors for alerts and destructive actions.",
    id: "destructive-colors",
    title: "Destructive",
    tokenNames: ["destructive", "destructiveForeground"],
  },
  {
    description: "Border, input, and focus ring tokens that hold the editor shell together.",
    id: "border-input-colors",
    title: "Border & Input",
    tokenNames: [
      "border",
      "input",
      "ring",
    ],
  },
  {
    description: "Chart tokens for dashboard data marks and compact analytics surfaces.",
    id: "chart-colors",
    title: "Chart",
    tokenNames: ["chart1", "chart2", "chart3", "chart4", "chart5"],
  },
  {
    description: "Sidebar tokens for app navigation shells and inset workbench frames.",
    id: "sidebar-colors",
    title: "Sidebar",
    tokenNames: [
      "sidebar",
      "sidebarForeground",
      "sidebarPrimary",
      "sidebarPrimaryForeground",
      "sidebarAccent",
      "sidebarAccentForeground",
      "sidebarBorder",
      "sidebarRing",
    ],
  },
]
const fontPresetOptions: Record<
  "heading" | "mono" | "sans" | "serif",
  FontPickerOption[]
> = {
  sans: [
    {
      category: "Sans",
      label: "Inter",
      value: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "IBM Plex Sans",
      value: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "Geist",
      value: '"Geist", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "DM Sans",
      value: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "Plus Jakarta Sans",
      value: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "Manrope",
      value: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    },
  ],
  heading: [
    {
      category: "Heading",
      label: "Merriweather",
      value: '"Merriweather", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Fraunces",
      value: '"Fraunces", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Playfair Display",
      value: '"Playfair Display", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Lora",
      value: '"Lora", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Cormorant Garamond",
      value: '"Cormorant Garamond", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Libre Baskerville",
      value: '"Libre Baskerville", Georgia, serif',
    },
  ],
  serif: [
    {
      category: "Serif",
      label: "Merriweather",
      value: '"Merriweather", Georgia, serif',
    },
    {
      category: "Serif",
      label: "Lora",
      value: '"Lora", Georgia, serif',
    },
    {
      category: "Serif",
      label: "Source Serif 4",
      value: '"Source Serif 4", Georgia, serif',
    },
    {
      category: "Serif",
      label: "IBM Plex Serif",
      value: '"IBM Plex Serif", Georgia, serif',
    },
  ],
  mono: [
    {
      category: "Mono",
      label: "JetBrains Mono",
      value: '"JetBrains Mono", ui-monospace, monospace',
    },
    {
      category: "Mono",
      label: "IBM Plex Mono",
      value: '"IBM Plex Mono", ui-monospace, monospace',
    },
    {
      category: "Mono",
      label: "Geist Mono",
      value: '"Geist Mono", ui-monospace, monospace',
    },
    {
      category: "Mono",
      label: "Source Code Pro",
      value: '"Source Code Pro", ui-monospace, monospace',
    },
  ],
}

export function GalleryApp({
  availableStyleReferences,
  initialProfile,
  runtimeRendererVerification,
  styleReference,
}: {
  availableStyleReferences: string[]
  initialProfile: ArtifactProfile
  runtimeRendererVerification: RuntimeVerificationState
  styleReference: string
}) {
  const rendererSpecByName = React.useMemo(() => {
    const specByName = createRendererSpecMap(runtimeRendererVerification)
    assertRendererRegistryParity(runtimeRendererVerification, specByName)
    return specByName
  }, [runtimeRendererVerification])
  const [editorState, setEditorState] = React.useState<GalleryEditorState>({
    availableStyleReferences,
    createId: "",
    draftProfile: initialProfile,
    error: "",
    isDirty: false,
    isSaving: false,
    persistedProfile: initialProfile,
    status: "Style gallery ready.",
    styleReference,
  })
  const [controlTab, setControlTab] =
    React.useState<GalleryControlTab>("colors")
  const [colorSectionValues, setColorSectionValues] = React.useState<string[]>([
    "base-tokens",
    "surface-tokens",
  ])
  const [presetSearch, setPresetSearch] = React.useState("")
  const [presetPopoverOpen, setPresetPopoverOpen] = React.useState(false)
  const [colorSearch, setColorSearch] = React.useState("")
  const [colorThemeSyncEnabled, setColorThemeSyncEnabled] =
    React.useState(false)
  const [previewMode, setPreviewMode] =
    React.useState<GalleryPreviewMode>("components")
  const [previewThemeMode, setPreviewThemeMode] =
    React.useState<GalleryPreviewThemeMode>("light")
  const [inspectorEnabled, setInspectorEnabled] = React.useState(false)
  const [inspectorState, setInspectorState] =
    React.useState<GalleryInspectorState | null>(null)
  const [focusedToken, setFocusedToken] =
    React.useState<FocusedThemeToken | null>(null)
  const [focusedEditorField, setFocusedEditorField] =
    React.useState<FocusedEditorField | null>(null)
  const [hasCopiedProfile, setHasCopiedProfile] = React.useState(false)
  const [isPreviewFullscreen, setIsPreviewFullscreen] = React.useState(false)
  const [mobileTab, setMobileTab] = React.useState<"controls" | "preview">(
    "controls",
  )
  const previewShellRef = React.useRef<HTMLDivElement | null>(null)
  const previewSurfaceRef = React.useRef<HTMLDivElement | null>(null)
  const pinnedInspectorElementRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    let cancelled = false

    void fetchGalleryState().then((nextState) => {
      if (!nextState || cancelled) {
        return
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          nextState.availableArtifactProfileReferences ??
          nextState.availableStyleReferences ??
          current.availableStyleReferences,
        draftProfile: current.isDirty
          ? current.draftProfile
          : nextState.artifactProfile,
        error: "",
        persistedProfile: nextState.artifactProfile,
        status: current.isDirty ? current.status : "Style gallery ready.",
        styleReference: current.isDirty
          ? current.styleReference
          : (nextState.artifactProfileReference ?? nextState.styleReference ?? current.styleReference),
      }))
    })

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const handleFullscreenChange = () => {
      setIsPreviewFullscreen(
        document.fullscreenElement === previewShellRef.current,
      )
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    handleFullscreenChange()

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const RendererNode = React.useMemo(
    () =>
      createRendererNode(
        rendererSpecByName,
        editorState.draftProfile.componentStyle.treatments,
        editorState.draftProfile,
      ),
    [editorState.draftProfile, editorState.draftProfile.componentStyle.treatments],
  )
  const documentStyleCss = React.useMemo(
    () => createDocumentStyleCss(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const previewThemeCss = React.useMemo(
    () => createGalleryPreviewThemeCss(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const previewSections = React.useMemo(
    () => createGalleryPreviewSections(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const filteredStyleReferences = React.useMemo(() => {
    const query = presetSearch.trim().toLowerCase()

    if (!query) {
      return editorState.availableStyleReferences
    }

    return editorState.availableStyleReferences.filter((styleReference) =>
      styleReference.toLowerCase().includes(query),
    )
  }, [editorState.availableStyleReferences, presetSearch])
  const filteredBuiltInStyleReferences = React.useMemo(
    () =>
      filteredStyleReferences.filter((styleReference) =>
        isBuiltInStyleReference(styleReference),
      ),
    [filteredStyleReferences],
  )
  const filteredCustomStyleReferences = React.useMemo(
    () =>
      filteredStyleReferences.filter(
        (styleReference) => !isBuiltInStyleReference(styleReference),
      ),
    [filteredStyleReferences],
  )
  const filteredColorTokenSections = React.useMemo(() => {
    const query = colorSearch.trim().toLowerCase()

    if (!query) {
      return colorTokenSections
    }

    return colorTokenSections
      .map((section) => {
        const matchedTokenNames = section.tokenNames.filter((tokenName) => {
          const tokenKey = tokenName.toLowerCase()
          const tokenLabel = formatThemeTokenLabel(tokenName).toLowerCase()

          return tokenKey.includes(query) || tokenLabel.includes(query)
        })

        const sectionMatches =
          section.title.toLowerCase().includes(query) ||
          section.description.toLowerCase().includes(query)

        return {
          ...section,
          tokenNames: sectionMatches ? section.tokenNames : matchedTokenNames,
        }
      })
      .filter((section) => section.tokenNames.length > 0)
  }, [colorSearch])
  const visiblePreviewSections = React.useMemo(
    () =>
      previewMode === "full"
        ? previewSections
        : previewSections.filter((section) => section.mode === previewMode),
    [previewMode, previewSections],
  )
  const previewModeLabel =
    previewMode === "full"
      ? "component-gallery"
        : previewMode === "colors"
          ? "color-palette"
          : previewMode === "custom"
            ? "custom-preview"
        : previewMode === "dashboard"
          ? "dashboard-preview"
          : previewMode === "mail"
            ? "mail-preview"
          : previewMode === "pricing"
            ? "pricing-preview"
          : previewMode === "selection"
            ? "selection-preview"
        : previewMode

  const activeStyleIsBuiltIn = isBuiltInStyleReference(
    editorState.styleReference,
  )
  const activeStyleKindLabel = activeStyleIsBuiltIn ? "Built-in" : "Custom"
  const activeStyleSummary = activeStyleIsBuiltIn
    ? "Read-only baseline preset"
    : "Saved custom preset"
  const activeStyleEditorStatus = editorState.isDirty
    ? "Current draft differs from the saved preset."
    : activeStyleIsBuiltIn
      ? "Baseline preset loaded in the editor."
      : "Saved preset loaded in the editor."

  const updateDraftProfile = React.useCallback(
    (updater: (draft: ArtifactProfile) => ArtifactProfile) => {
      setEditorState((current) => ({
        ...current,
        draftProfile: updater(current.draftProfile),
        error: "",
        isDirty: true,
        status: "Unsaved changes.",
      }))
    },
    [],
  )

  const updateThemeTokenValue = React.useCallback(
    (tokenName: ThemeTokenName, value: string) => {
      updateDraftProfile((draft) => {
        const nextTokenSets = {
          ...draft.globalStyle.tokenSets,
          [previewThemeMode]: {
            ...draft.globalStyle.tokenSets[previewThemeMode],
            [tokenName]: value,
          },
        }

        if (colorThemeSyncEnabled) {
          const otherMode =
            previewThemeMode === "light" ? "dark" : "light"

          nextTokenSets[otherMode] = {
            ...draft.globalStyle.tokenSets[otherMode],
            [tokenName]: value,
          }
        }

        return {
          ...draft,
          globalStyle: {
            ...draft.globalStyle,
            tokenSets: nextTokenSets,
          },
        }
      })
    },
    [colorThemeSyncEnabled, previewThemeMode, updateDraftProfile],
  )

  const copyThemeTokens = React.useCallback(
    (
      sourceMode: GalleryPreviewThemeMode,
      targetMode: GalleryPreviewThemeMode,
    ) => {
      updateDraftProfile((draft) => ({
        ...draft,
        globalStyle: {
          ...draft.globalStyle,
          tokenSets: {
            ...draft.globalStyle.tokenSets,
            [targetMode]: {
              ...draft.globalStyle.tokenSets[sourceMode],
            },
          },
        },
      }))
    },
    [updateDraftProfile],
  )

  const openControlTab = React.useCallback((nextTab: GalleryControlTab) => {
    setControlTab(nextTab)
    setMobileTab("controls")

    if (nextTab !== "colors") {
      setFocusedToken(null)
    }

    if (nextTab !== "typography" && nextTab !== "other") {
      setFocusedEditorField(null)
    }
  }, [])

  const focusEditorField = React.useCallback(
    (field: FocusedEditorField) => {
      openControlTab(
        field === "radiusBase" || field === "spacing" || field === "shadow"
          ? "other"
          : "typography",
      )
      setFocusedEditorField(field)
    },
    [openControlTab],
  )

  const focusThemeToken = React.useCallback(
    (
      tokenName: ThemeTokenName,
      mode: GalleryPreviewThemeMode = previewThemeMode,
    ) => {
      const sectionValue = getColorSectionIdForToken(tokenName)

      openControlTab("colors")
      setPreviewThemeMode(mode)
      setColorSectionValues((current) =>
        current.includes(sectionValue) ? current : [...current, sectionValue],
      )
      setFocusedToken({
        mode,
        tokenName,
      })
    },
    [openControlTab, previewThemeMode],
  )

  React.useEffect(() => {
    setFocusedToken(null)
  }, [editorState.styleReference, previewMode, previewThemeMode])

  React.useEffect(() => {
    setFocusedEditorField(null)
  }, [editorState.styleReference, previewMode])

  const saveProfile = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: "Saving style profile...",
    }))

    try {
      const response = await fetch("/__ahtml/gallery/save", {
        body: JSON.stringify({
          artifactProfile: editorState.draftProfile,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const result = (await response.json()) as GalleryMutationResponse

      if (
        !response.ok ||
        !result.ok ||
        !result.artifactProfile ||
        !(result.artifactProfileReference ?? result.styleReference)
      ) {
        throw new Error(result.error ?? "Unable to save gallery style profile.")
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          result.availableArtifactProfileReferences ??
          result.availableStyleReferences ??
          current.availableStyleReferences,
        draftProfile: result.artifactProfile!,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile!,
        status: `Saved ${result.artifactProfileReference ?? result.styleReference}.`,
        styleReference: (result.artifactProfileReference ?? result.styleReference)!,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Save failed.",
      }))
    }
  }, [editorState])

  const selectStyleReference = React.useCallback(
    async (nextStyleReference: string) => {
      setEditorState((current) => ({
        ...current,
        error: "",
        status: `Loading ${nextStyleReference}...`,
      }))

      try {
        const response = await fetch("/__ahtml/gallery/select", {
          body: JSON.stringify({
            artifactProfileReference: nextStyleReference,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        })
        const result = (await response.json()) as GalleryMutationResponse

        if (
          !response.ok ||
          !result.ok ||
          !result.artifactProfile ||
          !(result.artifactProfileReference ?? result.styleReference)
        ) {
          throw new Error(result.error ?? "Unable to switch style profile.")
        }

        setEditorState((current) => ({
          ...current,
          availableStyleReferences:
            result.availableArtifactProfileReferences ??
            result.availableStyleReferences ??
            current.availableStyleReferences,
          draftProfile: result.artifactProfile!,
          error: "",
          isDirty: false,
          persistedProfile: result.artifactProfile!,
          status: `Selected ${result.artifactProfileReference ?? result.styleReference}.`,
          styleReference:
            (result.artifactProfileReference ?? result.styleReference)!,
        }))
      } catch (error) {
        setEditorState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : String(error),
          status: "Switch failed.",
        }))
      }
    },
    [],
  )

  const cycleStyleReference = React.useCallback(
    (direction: "prev" | "next") => {
      const styleIds = editorState.availableStyleReferences
      const currentIndex = styleIds.indexOf(editorState.styleReference)

      if (currentIndex === -1 || styleIds.length < 2) {
        return
      }

      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % styleIds.length
          : (currentIndex - 1 + styleIds.length) % styleIds.length

      void selectStyleReference(styleIds[nextIndex])
    },
    [
      editorState.availableStyleReferences,
      editorState.styleReference,
      selectStyleReference,
    ],
  )

  const randomizeStyleReference = React.useCallback(() => {
    const styleIds = editorState.availableStyleReferences

    if (styleIds.length < 2) {
      return
    }

    const nextCandidates = styleIds.filter(
      (styleId) => styleId !== editorState.styleReference,
    )
    const nextStyleReference =
      nextCandidates[Math.floor(Math.random() * nextCandidates.length)]

    if (nextStyleReference) {
      void selectStyleReference(nextStyleReference)
    }
  }, [
    editorState.availableStyleReferences,
    editorState.styleReference,
    selectStyleReference,
  ])

  const copyCurrentStyleProfile = React.useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
      setEditorState((current) => ({
        ...current,
        status: "Clipboard unavailable in this runtime.",
      }))
      return
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(editorState.draftProfile, null, 2),
      )
      setHasCopiedProfile(true)
      setEditorState((current) => ({
        ...current,
        status: `Copied ${current.styleReference} JSON.`,
      }))
      window.setTimeout(() => {
        setHasCopiedProfile(false)
      }, 1800)
    } catch {
      setEditorState((current) => ({
        ...current,
        status: "Copy failed.",
      }))
    }
  }, [editorState.draftProfile])

  const createStyleReference = React.useCallback(async () => {
    const createId = editorState.createId.trim()

    if (!createId) {
      setEditorState((current) => ({
        ...current,
        error: 'New style id is required, for example "team-ops".',
      }))
      return
    }

    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Creating ${createId}...`,
    }))

    try {
      const response = await fetch("/__ahtml/gallery/create", {
          body: JSON.stringify({
          artifactProfileReference: createId,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const result = (await response.json()) as GalleryMutationResponse

      if (
        !response.ok ||
        !result.ok ||
        !result.artifactProfile ||
        !(result.artifactProfileReference ?? result.styleReference)
      ) {
        throw new Error(result.error ?? "Unable to create style profile.")
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          result.availableArtifactProfileReferences ??
          result.availableStyleReferences ??
          current.availableStyleReferences,
        createId: "",
        draftProfile: result.artifactProfile!,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile!,
        status: `Created ${result.artifactProfileReference ?? result.styleReference}.`,
        styleReference:
          (result.artifactProfileReference ?? result.styleReference)!,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Create failed.",
      }))
    }
  }, [editorState.createId])

  const deleteCurrentStyleReference = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Deleting ${current.styleReference}...`,
    }))

    try {
      const response = await fetch("/__ahtml/gallery/delete", {
        body: JSON.stringify({
          artifactProfileReference: editorState.styleReference,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const result = (await response.json()) as GalleryMutationResponse

      if (
        !response.ok ||
        !result.ok ||
        !result.artifactProfile ||
        !(result.artifactProfileReference ?? result.styleReference)
      ) {
        throw new Error(result.error ?? "Unable to delete style profile.")
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          result.availableArtifactProfileReferences ??
          result.availableStyleReferences ??
          current.availableStyleReferences,
        draftProfile: result.artifactProfile!,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile!,
        status: `Deleted style. Current is ${result.artifactProfileReference ?? result.styleReference}.`,
        styleReference:
          (result.artifactProfileReference ?? result.styleReference)!,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Delete failed.",
      }))
    }
  }, [editorState.styleReference])

  const resetDraft = React.useCallback(() => {
    setEditorState((current) => ({
      ...current,
      draftProfile: current.persistedProfile,
      error: "",
      isDirty: false,
      status: `Reset ${current.styleReference}.`,
    }))
  }, [])

  const togglePreviewFullscreen = React.useCallback(async () => {
    if (typeof document === "undefined") {
      return
    }

    const previewShell = previewShellRef.current

    if (!previewShell) {
      return
    }

    try {
      if (document.fullscreenElement === previewShell) {
        await document.exitFullscreen()
        return
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }

      await previewShell.requestFullscreen()
    } catch {
      // Ignore fullscreen API failures and keep the workbench usable.
    }
  }, [])

  React.useEffect(() => {
    const surface = previewSurfaceRef.current

    if (!surface) {
      return
    }

    const resetInspector = () => {
      setInspectorState(null)
    }

    if (!inspectorEnabled) {
      pinnedInspectorElementRef.current = null
      resetInspector()
      return
    }

    const getComponentLabel = (target: HTMLElement) => {
      const cardTitle =
        target.querySelector(
          '[data-slot="card-title"], h1, h2, h3, h4, h5, h6',
        ) ?? target

      const text = cardTitle.textContent?.trim() ?? target.textContent?.trim()
      return text ? text.slice(0, 80) : "Component"
    }

    const createInspectorState = (
      target: HTMLElement,
      pinned: boolean,
    ): GalleryInspectorState | null => {
      const component = target.dataset.agentHtmlComponent

      if (!component) {
        return null
      }

      const surfaceRect = surface.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const classTokens = Array.from(
        new Set(
          (target.className || "")
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
      const sourceTokens = collectInspectorSourceTokens(target)

      return {
        classTokens,
        component,
        label: getComponentLabel(target),
        left: targetRect.left - surfaceRect.left + surface.scrollLeft,
        path: target.dataset.ahtmlPath ?? "0",
        pinned,
        renderKind: target.dataset.ahtmlRenderKind ?? "structural",
        sourceTokens,
        slot:
          target.dataset.slot ??
          target.getAttribute("data-slot") ??
          "component-root",
        source: target.dataset.ahtmlSource ?? "ahtml-standard",
        tagName: target.tagName.toLowerCase(),
        top: targetRect.top - surfaceRect.top + surface.scrollTop,
        treatment: target.dataset.ahtmlTreatment ?? "default",
        width: targetRect.width,
        height: targetRect.height,
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rawTarget =
        event.target instanceof HTMLElement ? event.target : null

      if (!rawTarget) {
        return
      }

      const componentTarget = rawTarget.closest<HTMLElement>(
        "[data-agent-html-component]",
      )

      if (!componentTarget || !surface.contains(componentTarget)) {
        if (!pinnedInspectorElementRef.current) {
          resetInspector()
        }
        return
      }

      if (pinnedInspectorElementRef.current) {
        return
      }

      const nextState = createInspectorState(componentTarget, false)

      if (nextState) {
        setInspectorState(nextState)
      }
    }

    const handleClick = (event: MouseEvent) => {
      const rawTarget =
        event.target instanceof HTMLElement ? event.target : null

      if (!rawTarget) {
        return
      }

      const componentTarget = rawTarget.closest<HTMLElement>(
        "[data-agent-html-component]",
      )

      if (!componentTarget || !surface.contains(componentTarget)) {
        pinnedInspectorElementRef.current = null
        resetInspector()
        return
      }

      const nextPinnedState = createInspectorState(componentTarget, true)

      if (!nextPinnedState) {
        return
      }

      pinnedInspectorElementRef.current = componentTarget
      setInspectorState(nextPinnedState)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }

      pinnedInspectorElementRef.current = null
      resetInspector()
    }

    const handleScroll = () => {
      if (!pinnedInspectorElementRef.current) {
        return
      }

      const nextPinnedState = createInspectorState(
        pinnedInspectorElementRef.current,
        true,
      )

      if (nextPinnedState) {
        setInspectorState(nextPinnedState)
      }
    }

    const handlePointerLeave = () => {
      if (!pinnedInspectorElementRef.current) {
        resetInspector()
      }
    }

    surface.addEventListener("pointermove", handlePointerMove)
    surface.addEventListener("pointerleave", handlePointerLeave)
    surface.addEventListener("click", handleClick)
    surface.addEventListener("scroll", handleScroll)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      surface.removeEventListener("pointermove", handlePointerMove)
      surface.removeEventListener("pointerleave", handlePointerLeave)
      surface.removeEventListener("click", handleClick)
      surface.removeEventListener("scroll", handleScroll)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [inspectorEnabled, previewMode])

  return (
    <>
      <RuntimeStyleElements
        documentStyleCss={documentStyleCss}
        galleryPreviewThemeCss={previewThemeCss}
        includeGalleryShell
      />
      <main
        className="ahtml-runtime-host ahtml-gallery-shell"
        data-artifact-profile={editorState.draftProfile.id}
        data-style-profile={editorState.draftProfile.id}
      >
        <header
          className="ahtml-gallery-page-header"
          data-gallery-frame="header"
        >
          <div className="ahtml-gallery-page-brand">
            <strong>agent-html</strong>
            <span>Gallery</span>
          </div>
          <div className="ahtml-gallery-header-actions">
            <Badge variant="outline">{editorState.styleReference}</Badge>
            <Button asChild size="sm" variant="ghost">
              <a
                href="https://github.com/Sayhi-bzb/Agent-HTML"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </Button>
          </div>
        </header>
        <Tabs
          className="ahtml-gallery-mobile-tabs"
          onValueChange={(value) =>
            setMobileTab(value as "controls" | "preview")
          }
          value={mobileTab}
        >
          <TabsList className="ahtml-gallery-mobile-tabs-list">
            <GalleryTabsTriggerPill
              className="ahtml-gallery-mobile-tabs-trigger"
              value="controls"
            >
              Controls
            </GalleryTabsTriggerPill>
            <GalleryTabsTriggerPill
              className="ahtml-gallery-mobile-tabs-trigger"
              value="preview"
            >
              Preview
            </GalleryTabsTriggerPill>
          </TabsList>
        </Tabs>
        <div className="ahtml-gallery-main">
          <ResizablePanelGroup
            className="ahtml-gallery-workbench"
            direction="horizontal"
          >
            <ResizablePanel
              className="ahtml-gallery-sidebar"
              data-gallery-frame="controls"
              data-mobile-panel={mobileTab === "controls" ? "active" : "hidden"}
              defaultSize={30}
              minSize={22}
              maxSize={42}
            >
              <div className="ahtml-gallery-sidebar-inner">
                <Tabs
                  className="ahtml-gallery-control-tabs"
                  onValueChange={(value) => {
                    const nextTab = value as GalleryControlTab
                    setControlTab(nextTab)
                    if (nextTab !== "colors") {
                      setFocusedToken(null)
                    }
                    if (nextTab !== "typography" && nextTab !== "other") {
                      setFocusedEditorField(null)
                    }
                  }}
                  value={controlTab}
                >
                  <div
                    className="ahtml-gallery-control-header ahtml-gallery-toolbar-border"
                    data-gallery-frame="hero"
                  >
                    <div className="ahtml-gallery-control-header-row">
                      <div className="ahtml-gallery-toolbar-copy">
                        <span className="ahtml-gallery-toolbar-label">
                          Preset controls
                        </span>
                        <span className="ahtml-gallery-toolbar-caption">
                          {activeStyleEditorStatus}
                        </span>
                      </div>
                      <div className="ahtml-gallery-preset-rail-status">
                        <Badge
                          variant={
                            activeStyleIsBuiltIn ? "outline" : "secondary"
                          }
                        >
                          {activeStyleKindLabel}
                        </Badge>
                        <Badge variant="secondary">
                          {editorState.isDirty
                            ? "Draft unsaved"
                            : "Preview synced"}
                        </Badge>
                      </div>
                    </div>
                    <div className="ahtml-gallery-control-header-row">
                      <Popover
                        onOpenChange={setPresetPopoverOpen}
                        open={presetPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            className="ahtml-gallery-preset-popover-trigger"
                            size="sm"
                            title={`Open preset chooser for ${editorState.styleReference}`}
                            type="button"
                            variant="ghost"
                          >
                            <span className="ahtml-gallery-preset-swatch-row">
                              <span
                                className="ahtml-gallery-preset-swatch"
                                style={{
                                  background:
                                    editorState.draftProfile.globalStyle
                                      .tokenSets[previewThemeMode].primary,
                                }}
                              />
                              <span
                                className="ahtml-gallery-preset-swatch"
                                style={{
                                  background:
                                    editorState.draftProfile.globalStyle
                                      .tokenSets[previewThemeMode].accent,
                                }}
                              />
                              <span
                                className="ahtml-gallery-preset-swatch"
                                style={{
                                  background:
                                    editorState.draftProfile.globalStyle
                                      .tokenSets[previewThemeMode].secondary,
                                }}
                              />
                              <span
                                className="ahtml-gallery-preset-swatch"
                                style={{
                                  background:
                                    editorState.draftProfile.globalStyle
                                      .tokenSets[previewThemeMode].border,
                                }}
                              />
                            </span>
                            <span className="ahtml-gallery-preset-trigger-copy">
                              <strong>{editorState.styleReference}</strong>
                              <span>{activeStyleSummary}</span>
                            </span>
                            <ChevronDown
                              aria-hidden="true"
                              className="ahtml-gallery-preset-chevron"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="ahtml-gallery-preset-popover"
                        >
                          <PopoverHeader>
                            <PopoverTitle>Preset chooser</PopoverTitle>
                            <PopoverDescription>
                              Switch built-in and saved profiles without
                              leaving the editor shell.
                            </PopoverDescription>
                          </PopoverHeader>
                          <div className="ahtml-gallery-preset-search-wrap">
                            <div className="ahtml-gallery-preset-search-field">
                              <Search
                                aria-hidden="true"
                                className="ahtml-gallery-preset-search-icon"
                              />
                              <Input
                                aria-label="Search style presets"
                                className="ahtml-gallery-control-input-mono ahtml-gallery-preset-search-input"
                                onChange={(event) =>
                                  setPresetSearch(event.target.value)
                                }
                                placeholder="Search presets or ids..."
                                value={presetSearch}
                              />
                            </div>
                          </div>
                          <div className="ahtml-gallery-preset-popover-stats">
                            <div className="ahtml-gallery-preset-popover-stat">
                              <span>Visible</span>
                              <strong>
                                {filteredStyleReferences.length} preset
                                {filteredStyleReferences.length === 1 ? "" : "s"}
                              </strong>
                            </div>
                            <div className="ahtml-gallery-preset-popover-stat">
                              <span>Custom</span>
                              <strong>
                                {filteredCustomStyleReferences.length}
                              </strong>
                            </div>
                            <div className="ahtml-gallery-preset-popover-stat">
                              <span>Built-in</span>
                              <strong>
                                {filteredBuiltInStyleReferences.length}
                              </strong>
                            </div>
                            <div className="ahtml-gallery-preset-popover-stat">
                              <span>Preview</span>
                              <strong>{previewThemeMode}</strong>
                            </div>
                          </div>
                          <Separator />
                          <ScrollArea className="ahtml-gallery-preset-list-scroll">
                            <div className="ahtml-gallery-preset-list">
                              {filteredStyleReferences.length > 0 ? (
                                <>
                                  {filteredCustomStyleReferences.length > 0 ? (
                                    <div className="ahtml-gallery-preset-group">
                                      <div className="ahtml-gallery-preset-group-header">
                                        <span>Custom presets</span>
                                        <Badge variant="outline">
                                          {filteredCustomStyleReferences.length}
                                        </Badge>
                                      </div>
                                      {filteredCustomStyleReferences.map((styleId) =>
                                        renderPresetChooserOption({
                                          currentProfile:
                                            editorState.draftProfile,
                                          currentStyleReference:
                                            editorState.styleReference,
                                          onSelectStyleReference: (nextStyleId) => {
                                            setPresetPopoverOpen(false)
                                            setPresetSearch("")
                                            void selectStyleReference(nextStyleId)
                                          },
                                          isDraftDirty: editorState.isDirty,
                                          previewThemeMode,
                                          styleId,
                                        }),
                                      )}
                                    </div>
                                  ) : null}
                                  {filteredBuiltInStyleReferences.length > 0 ? (
                                    <div className="ahtml-gallery-preset-group">
                                      <div className="ahtml-gallery-preset-group-header">
                                        <span>Built-in presets</span>
                                        <Badge variant="outline">
                                          {filteredBuiltInStyleReferences.length}
                                        </Badge>
                                      </div>
                                      {filteredBuiltInStyleReferences.map((styleId) =>
                                        renderPresetChooserOption({
                                          currentProfile:
                                            editorState.draftProfile,
                                          currentStyleReference:
                                            editorState.styleReference,
                                          onSelectStyleReference: (nextStyleId) => {
                                            setPresetPopoverOpen(false)
                                            setPresetSearch("")
                                            void selectStyleReference(nextStyleId)
                                          },
                                          isDraftDirty: editorState.isDirty,
                                          previewThemeMode,
                                          styleId,
                                        }),
                                      )}
                                    </div>
                                  ) : null}
                                </>
                              ) : (
                                <div className="ahtml-gallery-preset-empty">
                                  No matching presets.
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      <div className="ahtml-gallery-preset-inline-tools">
                        <Button
                          aria-label="Previous style"
                          disabled={
                            editorState.isSaving ||
                            editorState.availableStyleReferences.length < 2
                          }
                          onClick={() => cycleStyleReference("prev")}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <ArrowLeft aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label="Random style"
                          disabled={
                            editorState.isSaving ||
                            editorState.availableStyleReferences.length < 2
                          }
                          onClick={randomizeStyleReference}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Shuffle aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label="Next style"
                          disabled={
                            editorState.isSaving ||
                            editorState.availableStyleReferences.length < 2
                          }
                          onClick={() => cycleStyleReference("next")}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <ArrowRight aria-hidden="true" />
                        </Button>
                      </div>
                      <div
                        className="ahtml-gallery-segmented-toggle ahtml-gallery-preset-theme-toggle"
                        role="group"
                        aria-label="Editor theme mode"
                      >
                        <span className="ahtml-gallery-toolbar-label">
                          Editor theme mode
                        </span>
                        <Button
                          aria-pressed={previewThemeMode === "light"}
                          className="ahtml-gallery-toggle-button"
                          onClick={() => setPreviewThemeMode("light")}
                          size="sm"
                          type="button"
                          variant={
                            previewThemeMode === "light"
                              ? "secondary"
                              : "ghost"
                          }
                        >
                          Light
                        </Button>
                        <Button
                          aria-pressed={previewThemeMode === "dark"}
                          className="ahtml-gallery-toggle-button"
                          onClick={() => setPreviewThemeMode("dark")}
                          size="sm"
                          type="button"
                          variant={
                            previewThemeMode === "dark"
                              ? "secondary"
                              : "ghost"
                          }
                        >
                          Dark
                        </Button>
                      </div>
                    </div>
                    <div className="ahtml-gallery-control-header-row ahtml-gallery-control-header-row-tabs">
                      <div className="ahtml-gallery-toolbar-copy">
                        <span className="ahtml-gallery-toolbar-label">
                          Controls
                        </span>
                        <span className="ahtml-gallery-toolbar-caption">
                          {editorState.status}
                        </span>
                      </div>
                      <ScrollArea className="ahtml-gallery-pill-scroll">
                        <TabsList className="ahtml-gallery-pill-tabs">
                          <GalleryTabsTriggerPill value="colors">
                            Colors
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="typography">
                            Typography
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="other">
                            Other
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="profile">
                            Profile
                          </GalleryTabsTriggerPill>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                    <div className="ahtml-gallery-preset-footnote">
                      <span>{activeStyleEditorStatus}</span>
                      <span>{activeStyleSummary}</span>
                    </div>
                  </div>

                  <ScrollArea className="ahtml-gallery-control-scroll">
                    <div className="ahtml-gallery-control-body">
                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="profile"
                      >
                        <Accordion
                          className="ahtml-gallery-control-sections"
                          defaultValue={["style-id", "persist"]}
                          type="multiple"
                        >
                          <AccordionItem value="style-id">
                            <AccordionTrigger>Style profile</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <FieldRow
                                  label="Current style id"
                                  value={editorState.styleReference}
                                />
                                <FieldRow
                                  label="Available ids"
                                  multiline
                                  value={editorState.availableStyleReferences.join(
                                    ", ",
                                  )}
                                />
                                <div className="ahtml-gallery-actions">
                                  <Button
                                    disabled={editorState.isSaving}
                                    onClick={() => void createStyleReference()}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    New Id
                                  </Button>
                                  <Button
                                    disabled={editorState.isSaving}
                                    onClick={() =>
                                      void deleteCurrentStyleReference()
                                    }
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    Delete Id
                                  </Button>
                                </div>
                                <LabeledInput
                                  description="Create a new persisted style reference from the current draft."
                                  label="New Style Id"
                                  mono
                                  value={editorState.createId}
                                  onChange={(value) =>
                                    setEditorState((current) => ({
                                      ...current,
                                      createId: value,
                                    }))
                                  }
                                />
                                {editorState.error ? (
                                  <Field data-invalid>
                                    <FieldLabel>Error</FieldLabel>
                                    <FieldDescription className="ahtml-gallery-error">
                                      {editorState.error}
                                    </FieldDescription>
                                  </Field>
                                ) : null}
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="persist">
                            <AccordionTrigger>Persist</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <FieldRow
                                  label="Status"
                                  value={editorState.status}
                                />
                                <FieldRow
                                  label="Preview mode"
                                  value={
                                    previewMode === "full"
                                      ? "component-gallery"
                                      : previewMode === "colors"
                                        ? "color-palette"
                                        : previewMode === "dashboard"
                                          ? "dashboard-preview"
                                          : previewMode === "mail"
                                            ? "mail-preview"
                                          : previewMode === "pricing"
                                            ? "pricing-preview"
                                            : previewMode === "selection"
                                              ? "selection-preview"
                                              : previewMode
                                  }
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>

                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="colors"
                      >
                        <div className="ahtml-gallery-control-filter-bar">
                          <div className="ahtml-gallery-control-filter-field">
                            <Search
                              aria-hidden="true"
                              className="ahtml-gallery-control-filter-icon"
                            />
                            <Input
                              aria-label="Search theme tokens"
                              className="ahtml-gallery-control-filter-input ahtml-gallery-control-input-mono"
                              onChange={(event) =>
                                setColorSearch(event.target.value)
                              }
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
                              {filteredColorTokenSections.reduce(
                                (count, section) => count + section.tokenNames.length,
                                0,
                              )}{" "}
                              control
                              {filteredColorTokenSections.reduce(
                                (count, section) => count + section.tokenNames.length,
                                0,
                              ) === 1
                                ? ""
                                : "s"}
                            </span>
                            <div className="ahtml-gallery-control-filter-actions">
                              <Button
                                className="ahtml-gallery-filter-pill"
                                onClick={() =>
                                  setColorThemeSyncEnabled((current) => !current)
                                }
                                size="sm"
                                type="button"
                                variant={
                                  colorThemeSyncEnabled ? "secondary" : "ghost"
                                }
                              >
                                {colorThemeSyncEnabled
                                  ? "Theme sync on"
                                  : "Theme sync"}
                              </Button>
                              <Button
                                className="ahtml-gallery-filter-pill"
                                onClick={() =>
                                  copyThemeTokens(
                                    previewThemeMode,
                                    previewThemeMode === "light"
                                      ? "dark"
                                      : "light",
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
                                      tokens={pickThemeTokens(
                                        editorState.draftProfile.globalStyle
                                          .tokenSets[previewThemeMode],
                                        section.tokenNames,
                                      )}
                                      onChange={updateThemeTokenValue}
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

                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="typography"
                      >
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
                                  options={fontPresetOptions.sans}
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.fontSans
                                  }
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
                                />
                                <FontPickerField
                                  description="Display font used for section titles and prominent headings."
                                  focused={focusedEditorField === "fontHeading"}
                                  label="Font Heading"
                                  options={fontPresetOptions.heading}
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.fontHeading
                                  }
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
                                />
                                <FontPickerField
                                  description="Serif companion used in richer editorial or marketing surfaces."
                                  focused={focusedEditorField === "fontSerif"}
                                  label="Font Serif"
                                  options={fontPresetOptions.serif}
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.fontSerif
                                  }
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
                                />
                                <FontPickerField
                                  description="Monospace font for token readouts, code, and utility surfaces."
                                  focused={focusedEditorField === "fontMono"}
                                  label="Font Mono"
                                  options={fontPresetOptions.mono}
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.fontMono
                                  }
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
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.letterSpacing
                                  }
                                />
                                <FieldRow
                                  label="Preview mode"
                                  value={previewThemeMode}
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>

                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="other"
                      >
                        <Accordion
                          className="ahtml-gallery-control-sections"
                          defaultValue={[
                            "geometry",
                            "spacing",
                            "shadow",
                            "component-treatments",
                          ]}
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
                                  step={0.025}
                                  unit="rem"
                                  value={parseFloat(
                                    editorState.draftProfile.globalStyle
                                      .radiusScale.base,
                                  )}
                                  onChange={(value) =>
                                    updateDraftProfile((draft) => ({
                                      ...draft,
                                      globalStyle: {
                                        ...draft.globalStyle,
                                        radiusScale: {
                                          ...draft.globalStyle.radiusScale,
                                          base: `${value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}rem`,
                                        },
                                      },
                                    }))
                                  }
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
                                  step={0.01}
                                  unit="rem"
                                  value={parseFloat(
                                    editorState.draftProfile.globalStyle
                                      .typography.spacing,
                                  )}
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
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.shadowColor
                                  }
                                />
                                <SliderInputField
                                  description="Opacity applied to the shared preview shadow."
                                  focused={focusedEditorField === "shadow"}
                                  label="Shadow Opacity"
                                  max={1}
                                  min={0}
                                  step={0.01}
                                  unit=""
                                  value={parseFloat(
                                    editorState.draftProfile.globalStyle
                                      .typography.shadowOpacity,
                                  )}
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
                                />
                                <div className="ahtml-gallery-shadow-grid">
                                  {[
                                    ["shadowBlur", "Shadow Blur", 0, 50, 0.5],
                                    ["shadowSpread", "Shadow Spread", -50, 50, 0.5],
                                    ["shadowOffsetX", "Shadow Offset X", -50, 50, 0.5],
                                    ["shadowOffsetY", "Shadow Offset Y", -50, 50, 0.5],
                                  ].map(([field, label, min, max, step]) => (
                                    <SliderInputField
                                      key={field}
                                      label={label}
                                      max={max as number}
                                      min={min as number}
                                      step={step as number}
                                      unit="px"
                                      value={parseFloat(
                                        editorState.draftProfile.globalStyle
                                          .typography[
                                          field as
                                            | "shadowBlur"
                                            | "shadowSpread"
                                            | "shadowOffsetX"
                                            | "shadowOffsetY"
                                        ].replace("px", ""),
                                      )}
                                      onChange={(value) =>
                                        updateDraftProfile((draft) => ({
                                          ...draft,
                                          globalStyle: {
                                            ...draft.globalStyle,
                                            typography: {
                                              ...draft.globalStyle.typography,
                                              [field]: `${value}px`,
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  ))}
                                </div>
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="component-treatments">
                            <AccordionTrigger>Treatments</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                {Object.entries(
                                  editorState.draftProfile.componentStyle
                                    .treatments,
                                )
                                  .sort(([left], [right]) =>
                                    left.localeCompare(right),
                                  )
                                  .map(([componentName, treatment]) => (
                                    <LabeledInput
                                      key={componentName}
                                      description="Treatment alias applied when the renderer maps this component into the gallery shell."
                                      label={componentName}
                                      mono
                                      value={treatment}
                                      onChange={(value) =>
                                        updateDraftProfile((draft) => ({
                                          ...draft,
                                          componentStyle: {
                                            ...draft.componentStyle,
                                            treatments: {
                                              ...draft.componentStyle
                                                .treatments,
                                              [componentName]: value,
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  ))}
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </Tabs>
              </div>
            </ResizablePanel>

            <ResizableHandle className="ahtml-gallery-divider" withHandle />

            <ResizablePanel
              className="ahtml-gallery-preview"
              data-gallery-frame="preview"
              data-mobile-panel={mobileTab === "preview" ? "active" : "hidden"}
              defaultSize={70}
              minSize={58}
            >
              <div
                className="ahtml-gallery-preview-shell"
                data-fullscreen={isPreviewFullscreen ? "true" : "false"}
                ref={previewShellRef}
              >
                <Tabs
                  className="ahtml-gallery-preview-tabs"
                  onValueChange={(value) =>
                    setPreviewMode(value as GalleryPreviewMode)
                  }
                  value={previewMode}
                >
                  <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border ahtml-gallery-preview-topbar">
                    <div className="ahtml-gallery-toolbar-copy">
                      <span className="ahtml-gallery-toolbar-label">
                        Preview actions
                      </span>
                      <span className="ahtml-gallery-toolbar-caption">
                        Style {editorState.styleReference} · Draft{" "}
                        {editorState.isDirty ? "unsaved" : "synced"} · Theme{" "}
                        {previewThemeMode}
                      </span>
                    </div>
                    <div className="ahtml-gallery-preview-toolbar">
                      <GalleryToolbarGroup label="Tools">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label="More editor tools"
                              className="ahtml-gallery-more-previews"
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <MoreVertical aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Editor tools</DropdownMenuLabel>
                            <DropdownMenuItem
                              onSelect={() => {
                                openControlTab("colors")
                                setPreviewMode("colors")
                              }}
                            >
                              Edit colors
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                openControlTab("typography")
                                setPreviewMode("typography")
                              }}
                            >
                              Edit typography
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => openControlTab("other")}
                            >
                              Edit geometry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => openControlTab("profile")}
                            >
                              Manage profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => setPreviewMode("components")}
                            >
                              Cards preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setPreviewMode("full")}
                            >
                              Full component gallery
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={() => void copyCurrentStyleProfile()}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {hasCopiedProfile ? (
                            <Check aria-hidden="true" />
                          ) : (
                            <Copy aria-hidden="true" />
                          )}
                          {hasCopiedProfile ? "Copied" : "Copy"}
                        </Button>
                      </GalleryToolbarGroup>
                      <GalleryToolbarGroup label="View">
                        <div
                          className="ahtml-gallery-segmented-toggle"
                          role="group"
                          aria-label="Preview theme"
                        >
                          <Button
                            aria-pressed={previewThemeMode === "light"}
                            className="ahtml-gallery-toggle-button"
                            onClick={() => setPreviewThemeMode("light")}
                            size="sm"
                            type="button"
                            variant={
                              previewThemeMode === "light"
                                ? "secondary"
                                : "ghost"
                            }
                          >
                            Light
                          </Button>
                          <Button
                            aria-pressed={previewThemeMode === "dark"}
                            className="ahtml-gallery-toggle-button"
                            onClick={() => setPreviewThemeMode("dark")}
                            size="sm"
                            type="button"
                            variant={
                              previewThemeMode === "dark"
                                ? "secondary"
                                : "ghost"
                            }
                          >
                            Dark
                          </Button>
                        </div>
                        <Button
                          aria-pressed={inspectorEnabled}
                          className="ahtml-gallery-inspector-button"
                          onClick={() =>
                            setInspectorEnabled((current) => !current)
                          }
                          size="sm"
                          type="button"
                          variant={inspectorEnabled ? "secondary" : "ghost"}
                        >
                          <Inspect aria-hidden="true" />
                          {inspectorEnabled ? "Inspecting" : "Inspect"}
                        </Button>
                        <Button
                          onClick={() => void togglePreviewFullscreen()}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {isPreviewFullscreen ? (
                            <Minimize2 aria-hidden="true" />
                          ) : (
                            <Maximize2 aria-hidden="true" />
                          )}
                          {isPreviewFullscreen
                            ? "Exit Fullscreen"
                            : "Fullscreen"}
                        </Button>
                      </GalleryToolbarGroup>
                      <GalleryToolbarGroup label="Persist">
                        <Button
                          disabled={
                            editorState.isSaving || !editorState.isDirty
                          }
                          onClick={resetDraft}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Reset
                        </Button>
                        <Button
                          disabled={editorState.isSaving}
                          onClick={() => void saveProfile()}
                          size="sm"
                          type="button"
                        >
                          Save Style
                        </Button>
                      </GalleryToolbarGroup>
                    </div>
                  </div>
                  <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border ahtml-gallery-preview-modebar">
                    <div className="ahtml-gallery-preview-mode-tools">
                      <ScrollArea className="ahtml-gallery-pill-scroll ahtml-gallery-preview-pill-scroll">
                        <TabsList className="ahtml-gallery-pill-tabs">
                          <GalleryTabsTriggerPill value="custom">
                            Custom
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="components">
                            Cards
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="dashboard">
                            Dashboard
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="mail">
                            Mail
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="pricing">
                            Pricing
                          </GalleryTabsTriggerPill>
                          <GalleryTabsTriggerPill value="colors">
                            Color Palette
                          </GalleryTabsTriggerPill>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="ahtml-gallery-more-previews"
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <MoreVertical aria-hidden="true" />
                            More previews
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Preview catalog</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => setPreviewMode("forms")}
                          >
                            Form controls
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPreviewMode("selection")}
                          >
                            Selection patterns
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPreviewMode("disclosure")}
                          >
                            Disclosure patterns
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setPreviewMode("typography")}
                          >
                            Typography audit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setPreviewMode("full")}
                          >
                            Full component gallery
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="ahtml-gallery-preview-context">
                      <span>Mode</span>
                      <strong>{previewModeLabel}</strong>
                      <span>Draft</span>
                      <strong>
                        {editorState.isDirty ? "unsaved" : "synced"}
                      </strong>
                      <span>Style</span>
                      <strong>{editorState.styleReference}</strong>
                    </div>
                  </div>
                  <section className="ahtml-gallery-preview-stage">
                    <ScrollArea className="ahtml-gallery-preview-canvas">
                      <TabsContent
                        className="ahtml-gallery-preview-panel"
                        value={previewMode}
                      >
                        <GalleryExamplesPreviewContainer
                          focusedToken={focusedToken}
                          inspectorEnabled={inspectorEnabled}
                          onInspectorTokenSelect={focusThemeToken}
                          inspectorState={inspectorState}
                          previewMode={previewMode}
                          previewThemeMode={previewThemeMode}
                          previewSurfaceRef={previewSurfaceRef}
                        >
                          {previewMode === "typography" ? (
                            <GalleryTypographyPanel
                              onSelectField={focusEditorField}
                              profile={editorState.draftProfile}
                              previewThemeMode={previewThemeMode}
                            />
                          ) : previewMode === "colors" ? (
                            <GalleryColorPreviewPanel
                              onActivateThemeMode={setPreviewThemeMode}
                              onSelectToken={focusThemeToken}
                              profile={editorState.draftProfile}
                              previewThemeMode={previewThemeMode}
                              themeSyncEnabled={colorThemeSyncEnabled}
                            />
                          ) : previewMode === "custom" ? (
                            <GalleryCustomPreviewPanel
                              profile={editorState.draftProfile}
                            />
                          ) : previewMode === "components" ? (
                            <GalleryCardsWorkbenchPanel
                              profile={editorState.draftProfile}
                              previewThemeMode={previewThemeMode}
                            />
                          ) : previewMode === "dashboard" ? (
                            <GalleryDashboardWorkbenchPanel
                              profile={editorState.draftProfile}
                              previewThemeMode={previewThemeMode}
                            />
                          ) : previewMode === "mail" ? (
                            <GalleryMailWorkbenchPanel
                              profile={editorState.draftProfile}
                              previewThemeMode={previewThemeMode}
                            />
                          ) : previewMode === "pricing" ? (
                            <GalleryPricingWorkbenchPanel
                              profile={editorState.draftProfile}
                              previewThemeMode={previewThemeMode}
                            />
                          ) : (
                            <DocumentArtifactShell
                              className="ahtml-gallery-preview-document"
                              layoutPolicy="gallery"
                            >
                              {visiblePreviewSections.map((section, index) => (
                                <RendererNode
                                  key={`${section.mode}-${index}`}
                                  node={section.node}
                                  path={[index]}
                                />
                              ))}
                            </DocumentArtifactShell>
                          )}
                        </GalleryExamplesPreviewContainer>
                      </TabsContent>
                    </ScrollArea>
                  </section>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}

function RuntimeStyleElements({
  documentStyleCss,
  galleryPreviewThemeCss,
  includeGalleryShell = false,
}: {
  documentStyleCss: string
  galleryPreviewThemeCss?: string
  includeGalleryShell?: boolean
}) {
  return (
    <>
      <style>{createRuntimeHostCss()}</style>
      <style>{createArtifactShellCss()}</style>
      <style>{createDocumentLayoutPolicyCss()}</style>
      <style>{createGalleryLayoutPolicyCss()}</style>
      {includeGalleryShell ? <style>{createGalleryShellCss()}</style> : null}
      {galleryPreviewThemeCss ? <style>{galleryPreviewThemeCss}</style> : null}
      <style>{documentStyleCss}</style>
    </>
  )
}

function DocumentArtifactShell({
  children,
  className,
  layoutPolicy = "document",
}: React.PropsWithChildren<{
  className?: string
  layoutPolicy?: "document" | "gallery"
}>) {
  const classes = [
    "ahtml-artifact-root",
    layoutPolicy === "document"
      ? "ahtml-layout-policy-document"
      : "ahtml-layout-policy-gallery",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={classes}>{children}</div>
}

function TokenEditor({
  labels,
  focusedToken,
  tokens,
  onChange,
}: {
  labels: Partial<Record<ThemeTokenName, string>>
  focusedToken?: ThemeTokenName | null
  tokens: Partial<StyleProfile["globalStyle"]["tokenSets"]["light"]>
  onChange: (
    tokenName: ThemeTokenName,
    value: string,
  ) => void
}) {
  const rowRefs = React.useRef(new Map<ThemeTokenName, HTMLDivElement>())
  const [openToken, setOpenToken] = React.useState<ThemeTokenName | null>(null)

  React.useEffect(() => {
    if (!focusedToken) {
      return
    }

    rowRefs.current.get(focusedToken)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [focusedToken])

  return (
    <div className="ahtml-gallery-stack">
      {Object.entries(tokens).map(([tokenName, tokenValue]) => (
        <div
          className={[
            "ahtml-gallery-token-row",
            focusedToken === tokenName ? "is-focused" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          data-focused={focusedToken === tokenName ? "true" : "false"}
          key={tokenName}
          ref={(node) => {
            const typedTokenName = tokenName as ThemeTokenName

            if (node) {
              rowRefs.current.set(typedTokenName, node)
              return
            }

            rowRefs.current.delete(typedTokenName)
          }}
        >
          <div className="ahtml-gallery-token-meta">
            <Popover
              onOpenChange={(open) =>
                setOpenToken(open ? (tokenName as ThemeTokenName) : null)
              }
              open={openToken === tokenName}
            >
              <PopoverTrigger asChild>
                <button
                  className="ahtml-gallery-color-trigger"
                  title={`Open ${tokenName} color controls`}
                  type="button"
                >
                  <span
                    className="ahtml-gallery-swatch"
                    style={{ background: tokenValue }}
                    aria-hidden="true"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="ahtml-gallery-color-popover"
              >
                <PopoverHeader>
                  <PopoverTitle>
                    {labels[tokenName as ThemeTokenName] ??
                      formatThemeTokenLabel(tokenName as ThemeTokenName)}
                  </PopoverTitle>
                  <PopoverDescription>{tokenName}</PopoverDescription>
                </PopoverHeader>
                <div className="ahtml-gallery-color-popover-grid">
                  {createTokenColorSuggestions(tokenValue ?? "").map((option) => (
                    <button
                      className="ahtml-gallery-color-suggestion"
                      key={option}
                      onClick={() =>
                        onChange(tokenName as ThemeTokenName, option)
                      }
                      title={`Apply ${option}`}
                      type="button"
                    >
                      <span
                        className="ahtml-gallery-color-suggestion-swatch"
                        style={{ background: option }}
                        aria-hidden="true"
                      />
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
                <div className="ahtml-gallery-color-popover-input-wrap">
                  <Input
                    className="ahtml-gallery-control-input ahtml-gallery-control-input-mono"
                    onChange={(event) =>
                      onChange(
                        tokenName as ThemeTokenName,
                        event.target.value,
                      )
                    }
                    value={tokenValue}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <div className="ahtml-gallery-token-copy">
              <strong>
                {labels[tokenName as ThemeTokenName] ??
                  formatThemeTokenLabel(tokenName as ThemeTokenName)}
              </strong>
              <span>{tokenName}</span>
            </div>
          </div>
          <div className="ahtml-gallery-token-input-wrap">
            <Input
              className="ahtml-gallery-control-input-mono ahtml-gallery-token-input"
              onChange={(event) =>
                onChange(
                  tokenName as ThemeTokenName,
                  event.target.value,
                )
              }
              value={tokenValue}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function createTokenColorSuggestions(tokenValue: string) {
  const sharedOptions = [
    "#ffffff",
    "#f8fafc",
    "#e2e8f0",
    "#cbd5e1",
    "#94a3b8",
    "#64748b",
    "#334155",
    "#0f172a",
  ]

  const options = tokenValue.startsWith("#")
    ? [tokenValue, ...sharedOptions]
    : sharedOptions

  return Array.from(new Set(options)).slice(0, 8)
}

function LabeledInput({
  description,
  label,
  mono = false,
  onChange,
  value,
}: {
  description?: string
  label: string
  mono?: boolean
  onChange: (value: string) => void
  value: string
}) {
  const id = React.useId()

  return (
    <Field className="ahtml-gallery-control-row">
      <div className="ahtml-gallery-control-copy">
        <FieldLabel className="ahtml-gallery-control-label" htmlFor={id}>
          {label}
        </FieldLabel>
        {description ? (
          <FieldDescription className="ahtml-gallery-control-description">
            {description}
          </FieldDescription>
        ) : null}
      </div>
      <div className="ahtml-gallery-control-input-wrap">
        <Input
          className={[
            "ahtml-gallery-control-input",
            mono ? "ahtml-gallery-control-input-mono" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      </div>
    </Field>
  )
}

function FontPickerField({
  description,
  focused = false,
  label,
  onChange,
  options,
  value,
}: {
  description?: string
  focused?: boolean
  label: string
  onChange: (value: string) => void
  options: FontPickerOption[]
  value: string
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const filteredOptions = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return options
    }

    return options.filter((option) =>
      [option.label, option.category, option.value]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [options, search])
  const currentOption =
    options.find((option) => option.value === value) ??
    ({
      category: label.includes("Heading") ? "Heading" : "Sans",
      label: extractFontName(value),
      value,
    } as FontPickerOption)

  React.useEffect(() => {
    if (!focused) {
      return
    }

    rootRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [focused])

  return (
    <div
      className={[
        "ahtml-gallery-font-field",
        focused ? "is-focused" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <Field className="ahtml-gallery-control-row ahtml-gallery-font-picker-row">
        <div className="ahtml-gallery-control-copy">
          <FieldLabel className="ahtml-gallery-control-label">{label}</FieldLabel>
          {description ? (
            <FieldDescription className="ahtml-gallery-control-description">
              {description}
            </FieldDescription>
          ) : null}
        </div>
        <div className="ahtml-gallery-control-input-wrap">
          <Popover
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen)
              if (!nextOpen) {
                setSearch("")
              }
            }}
            open={open}
          >
            <PopoverTrigger asChild>
              <Button
                className="ahtml-gallery-font-picker-trigger"
                size="sm"
                type="button"
                variant="outline"
              >
                <span className="ahtml-gallery-font-picker-trigger-copy">
                  <strong style={{ fontFamily: value }}>{currentOption.label}</strong>
                  <span>{currentOption.category}</span>
                </span>
                <ChevronDown aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="ahtml-gallery-font-picker-popover"
            >
              <PopoverHeader>
                <PopoverTitle>{label} picker</PopoverTitle>
                <PopoverDescription>
                  Search and apply a tighter font stack without leaving the
                  editor shell.
                </PopoverDescription>
              </PopoverHeader>
              <div className="ahtml-gallery-font-picker-search">
                <Search
                  aria-hidden="true"
                  className="ahtml-gallery-font-picker-search-icon"
                />
                <Input
                  className="ahtml-gallery-control-input-mono ahtml-gallery-font-picker-search-input"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search fonts..."
                  value={search}
                />
              </div>
              <ScrollArea className="ahtml-gallery-font-picker-list-scroll">
                <div className="ahtml-gallery-font-picker-list">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <button
                        className={[
                          "ahtml-gallery-font-picker-option",
                          option.value === value ? "is-active" : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={option.value}
                        onClick={() => {
                          onChange(option.value)
                          setOpen(false)
                          setSearch("")
                        }}
                        type="button"
                      >
                        <span className="ahtml-gallery-font-picker-option-copy">
                          <strong style={{ fontFamily: option.value }}>
                            {option.label}
                          </strong>
                          <span>{option.category}</span>
                        </span>
                        {option.value === value ? (
                          <Check aria-hidden="true" />
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <div className="ahtml-gallery-font-picker-empty">
                      No matching font presets.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </Field>
      <LabeledInput
        description="Raw font-family stack for custom fallback tuning."
        label={`${label} Stack`}
        mono
        onChange={onChange}
        value={value}
      />
    </div>
  )
}

function extractFontName(value: string) {
  return value.split(",")[0]?.trim().replace(/^"|"$/g, "") || value
}

function SliderInputField({
  description,
  focused = false,
  label,
  max,
  min,
  onChange,
  step,
  unit,
  value,
}: {
  description?: string
  focused?: boolean
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  unit: string
  value: number
}) {
  const id = React.useId()
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!focused) {
      return
    }

    rootRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [focused])

  return (
    <Field
      className={[
        "ahtml-gallery-control-row",
        focused ? "ahtml-gallery-control-row-focused" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <div className="ahtml-gallery-control-copy">
        <FieldLabel className="ahtml-gallery-control-label" htmlFor={id}>
          {label}
        </FieldLabel>
        {description ? (
          <FieldDescription className="ahtml-gallery-control-description">
            {description}
          </FieldDescription>
        ) : null}
      </div>
      <div className="ahtml-gallery-slider-field">
        <Slider
          className="ahtml-gallery-slider-control"
          id={id}
          max={max}
          min={min}
          onValueChange={(values) => onChange(values[0] ?? value)}
          step={step}
          value={[value]}
        />
        <div className="ahtml-gallery-slider-input-wrap">
          <Input
            className="ahtml-gallery-control-input ahtml-gallery-control-input-mono"
            onChange={(event) => {
              const nextValue = Number.parseFloat(event.target.value)

              if (!Number.isNaN(nextValue)) {
                onChange(Math.min(max, Math.max(min, nextValue)))
              }
            }}
            value={value}
          />
          <span className="ahtml-gallery-slider-unit">{unit}</span>
        </div>
      </div>
    </Field>
  )
}

function FieldRow({
  label,
  multiline = false,
  value,
}: {
  label: string
  multiline?: boolean
  value: string
}) {
  return (
    <Field className="ahtml-gallery-field-row">
      <div className="ahtml-gallery-control-copy">
        <FieldTitle className="ahtml-gallery-control-label">{label}</FieldTitle>
      </div>
      <FieldContent className="ahtml-gallery-control-value">
        <strong
          className={[
            "ahtml-gallery-control-readout",
            multiline ? "ahtml-gallery-wrap" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </strong>
      </FieldContent>
    </Field>
  )
}

function formatThemeTokenLabel(tokenName: ThemeTokenName) {
  return tokenName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getThemeTokenControlLabel(tokenName: ThemeTokenName) {
  switch (tokenName) {
    case "primary":
    case "secondary":
    case "accent":
    case "background":
    case "card":
    case "popover":
    case "muted":
    case "destructive":
    case "sidebar":
    case "sidebarPrimary":
    case "sidebarAccent":
    case "chart1":
    case "chart2":
    case "chart3":
    case "chart4":
    case "chart5":
      return "Background"
    case "primaryForeground":
    case "secondaryForeground":
    case "accentForeground":
    case "foreground":
    case "cardForeground":
    case "popoverForeground":
    case "mutedForeground":
    case "destructiveForeground":
    case "sidebarForeground":
    case "sidebarPrimaryForeground":
    case "sidebarAccentForeground":
      return "Foreground"
    case "border":
    case "sidebarBorder":
      return "Border"
    case "input":
      return "Input"
    case "ring":
    case "sidebarRing":
      return "Ring"
    default:
      return formatThemeTokenLabel(tokenName)
  }
}

function GalleryPanelBody({ children }: React.PropsWithChildren) {
  return (
    <div className="ahtml-gallery-stack ahtml-gallery-panel-body">
      {children}
    </div>
  )
}

function GalleryExamplesPreviewContainer({
  children,
  focusedToken,
  inspectorEnabled,
  onInspectorTokenSelect,
  inspectorState,
  previewMode,
  previewThemeMode,
  previewSurfaceRef,
}: React.PropsWithChildren<{
  focusedToken: FocusedThemeToken | null
  inspectorEnabled: boolean
  onInspectorTokenSelect: (
    tokenName: ThemeTokenName,
    mode: GalleryPreviewThemeMode,
  ) => void
  inspectorState: GalleryInspectorState | null
  previewMode: GalleryPreviewMode
  previewThemeMode: GalleryPreviewThemeMode
  previewSurfaceRef: React.RefObject<HTMLDivElement | null>
}>) {
  const classes = [
    "ahtml-gallery-stage-frame",
    `ahtml-gallery-stage-frame-${previewMode}`,
  ].join(" ")

  return (
    <div className={classes}>
      <div
        className="ahtml-gallery-preview-surface"
        data-theme-mode={previewThemeMode}
        data-inspector={inspectorEnabled ? "true" : "false"}
        ref={previewSurfaceRef}
      >
        {inspectorEnabled ? (
          <div className="ahtml-gallery-inspector-overlay">
            {inspectorState ? (
              <div
                className="ahtml-gallery-inspector-outline"
                style={{
                  height: `${inspectorState.height}px`,
                  left: `${inspectorState.left}px`,
                  top: `${inspectorState.top}px`,
                  width: `${inspectorState.width}px`,
                }}
              >
                <div className="ahtml-gallery-inspector-outline-label">
                  {inspectorState.component}
                </div>
              </div>
            ) : null}
            <div
              className="ahtml-gallery-inspector-panel"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <span className="ahtml-gallery-inspector-kicker">Inspector</span>
              <strong>{inspectorState?.component ?? "Hover a component"}</strong>
              <span>
                {inspectorState
                  ? `${inspectorState.label} · ${inspectorState.treatment}`
                  : "Move over a rendered component to inspect its role and treatment."}
              </span>
              <div className="ahtml-gallery-inspector-grid">
                <GalleryPreviewMeta
                  label="Render"
                  value={inspectorState?.renderKind ?? "structural"}
                />
                <GalleryPreviewMeta
                  label="Source"
                  value={inspectorState?.source ?? "ahtml-standard"}
                />
                <GalleryPreviewMeta
                  label="Path"
                  value={inspectorState?.path ?? "0"}
                />
                <GalleryPreviewMeta
                  label="Slot"
                  value={inspectorState?.slot ?? "component-root"}
                />
                <GalleryPreviewMeta
                  label="Tag"
                  value={inspectorState?.tagName ?? "n/a"}
                />
                <GalleryPreviewMeta
                  label="Frame"
                  value={
                    inspectorState
                      ? `${Math.round(inspectorState.width)}×${Math.round(
                          inspectorState.height,
                        )}`
                      : "n/a"
                  }
                />
              </div>
              <div className="ahtml-gallery-inspector-token-group">
                <span className="ahtml-gallery-inspector-token-label">
                  Classes
                </span>
                <div className="ahtml-gallery-inspector-token-list">
                  {(inspectorState?.classTokens.length
                    ? inspectorState.classTokens
                    : ["No class tokens"]
                  ).map((token) =>
                    renderInspectorTokenChip({
                      focusedToken,
                      keyPrefix: "class",
                      onSelect: onInspectorTokenSelect,
                      previewThemeMode,
                      token,
                    }),
                  )}
                </div>
              </div>
              <div className="ahtml-gallery-inspector-token-group">
                <span className="ahtml-gallery-inspector-token-label">
                  Source tokens
                </span>
                <div className="ahtml-gallery-inspector-token-list">
                  {(inspectorState?.sourceTokens.length
                    ? inspectorState.sourceTokens
                    : ["No source tokens"]
                  ).map((token) =>
                    renderInspectorTokenChip({
                      focusedToken,
                      keyPrefix: "source",
                      onSelect: onInspectorTokenSelect,
                      previewThemeMode,
                      token,
                    }),
                  )}
                </div>
              </div>
              <span className="ahtml-gallery-inspector-hint">
                {inspectorState?.pinned
                  ? "Pinned. Press Esc to release. Click a token to jump to matching controls."
                  : "Click to pin the current component. Token pills also jump into matching controls."}
              </span>
            </div>
          </div>
        ) : null}
        <div className="ahtml-gallery-preview-surface-inner">{children}</div>
      </div>
    </div>
  )
}

function GalleryPreviewMeta({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="ahtml-gallery-preview-meta">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function GalleryToolbarGroup({
  children,
  label,
}: React.PropsWithChildren<{
  label?: string
}>) {
  return (
    <div className="ahtml-gallery-toolbar-group">
      {label ? (
        <span className="ahtml-gallery-toolbar-group-label">{label}</span>
      ) : null}
      <div className="ahtml-gallery-toolbar-group-body">{children}</div>
    </div>
  )
}

function GalleryTabsTriggerPill({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={["ahtml-gallery-tabs-trigger-pill", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </TabsTrigger>
  )
}

function renderInspectorTokenChip({
  focusedToken,
  keyPrefix,
  onSelect,
  previewThemeMode,
  token,
}: {
  focusedToken: FocusedThemeToken | null
  keyPrefix: string
  onSelect: (tokenName: ThemeTokenName, mode: GalleryPreviewThemeMode) => void
  previewThemeMode: GalleryPreviewThemeMode
  token: string
}) {
  const resolvedToken = resolveFocusableThemeToken(token)
  const isFocused =
    resolvedToken !== null &&
    focusedToken?.mode === previewThemeMode &&
    focusedToken?.tokenName === resolvedToken

  if (!resolvedToken) {
    return (
      <span className="ahtml-gallery-inspector-token" key={`${keyPrefix}-${token}`}>
        {token}
      </span>
    )
  }

  return (
    <button
      className={[
        "ahtml-gallery-inspector-token",
        "is-action",
        isFocused ? "is-focused" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      key={`${keyPrefix}-${token}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onSelect(resolvedToken, previewThemeMode)
      }}
      title={`Jump to ${previewThemeMode} ${resolvedToken} token`}
      type="button"
    >
      {token}
    </button>
  )
}

function renderPresetChooserOption({
  currentProfile,
  currentStyleReference,
  isDraftDirty,
  onSelectStyleReference,
  previewThemeMode,
  styleId,
}: {
  currentProfile: StyleProfile
  currentStyleReference: string
  isDraftDirty: boolean
  onSelectStyleReference: (styleId: string) => void
  previewThemeMode: GalleryPreviewThemeMode
  styleId: string
}) {
  const isCurrent = styleId === currentStyleReference
  const isBuiltIn = isBuiltInStyleReference(styleId)
  const kindLabel = isBuiltIn ? "Built-in" : "Custom"
  const summary = isBuiltIn ? "Read-only baseline preset" : "Saved custom preset"
  const accessLabel = isBuiltIn ? "Locked" : "Editable"
  const currentLabel = isCurrent
    ? isDraftDirty
      ? "Current draft"
      : "Current preset"
    : "Open in editor"

  return (
    <button
      className={[
        "ahtml-gallery-preset-option",
        isCurrent ? "is-active" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      key={styleId}
      onClick={() => onSelectStyleReference(styleId)}
      title={`${styleId} • ${summary}`}
      type="button"
    >
      <span className="ahtml-gallery-preset-option-swatch-row">
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].primary
              : "var(--primary)",
          }}
        />
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].accent
              : "var(--accent)",
          }}
        />
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].secondary
              : "var(--secondary)",
          }}
        />
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].border
              : "var(--border)",
          }}
        />
      </span>
      <span className="ahtml-gallery-preset-option-copy">
        <span className="ahtml-gallery-preset-option-copy-top">
          <strong>{styleId}</strong>
          <span className="ahtml-gallery-preset-option-kicker">
            {summary}
          </span>
        </span>
        <span className="ahtml-gallery-preset-option-copy-meta">
          <span>{accessLabel}</span>
          <span>{previewThemeMode} preview</span>
          <span>{currentLabel}</span>
        </span>
      </span>
      <span className="ahtml-gallery-preset-option-status">
        <Badge variant={isCurrent ? "secondary" : "outline"}>
          {isCurrent ? "Current" : kindLabel}
        </Badge>
        {!isCurrent ? (
          <Badge variant={isBuiltIn ? "outline" : "secondary"}>
            {accessLabel}
          </Badge>
        ) : null}
      </span>
    </button>
  )
}

function pickThemeTokens(
  tokens: StyleProfile["globalStyle"]["tokenSets"]["light"],
  tokenNames: ThemeTokenName[],
) {
  return tokenNames.reduce<
    Partial<StyleProfile["globalStyle"]["tokenSets"]["light"]>
  >((result, tokenName) => {
    result[tokenName] = tokens[tokenName]
    return result
  }, {})
}

function getManualCardProps(
  profile: StyleProfile,
  path: string,
  className?: string,
) {
  const treatment = profile.componentStyle.treatments.card

  return {
    className: [className, "ahtml-gallery-workbench-card"]
      .filter(Boolean)
      .join(" "),
    "data-agent-html-component": "card",
    "data-ahtml-path": path,
    "data-ahtml-render-kind": "compound",
    "data-ahtml-source": "shadcn",
    ...(treatment ? { "data-ahtml-treatment": treatment } : {}),
  } as const
}

function fetchGalleryState() {
  return fetch("/__ahtml/gallery/state", {
    headers: {
      accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        return null
      }

      return (await response.json()) as GalleryStateResponse
    })
    .catch(() => null)
}

function GalleryTypographyPanel({
  onSelectField,
  profile,
  previewThemeMode,
}: {
  onSelectField: (field: FocusedEditorField) => void
  profile: StyleProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const activeTokens = profile.globalStyle.tokenSets[previewThemeMode]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-typography-panel">
      <div className="ahtml-gallery-stage-toolbar">
        <div className="ahtml-gallery-stage-toolbar-copy">
          <span className="ahtml-gallery-stage-panel-kicker">Typography audit</span>
          <strong>Type system preview surface</strong>
        </div>
        <div className="ahtml-gallery-stage-toolbar-meta">
          <GalleryPreviewMeta label="Heading" value={extractFontName(profile.globalStyle.typography.fontHeading)} />
          <GalleryPreviewMeta label="Sans" value={extractFontName(profile.globalStyle.typography.fontSans)} />
          <GalleryPreviewMeta label="Mono" value={extractFontName(profile.globalStyle.typography.fontMono)} />
        </div>
      </div>
      <div className="ahtml-gallery-typography-content">
        <button
          className="ahtml-gallery-typography-sample ahtml-gallery-stage-action-card"
          onClick={() => onSelectField("fontHeading")}
          type="button"
          style={{ letterSpacing: profile.globalStyle.typography.letterSpacing }}
        >
          <p className="ahtml-gallery-typography-kicker">Heading</p>
          <h2>{profile.globalStyle.typography.fontHeading}</h2>
          <p>
            Review rhythm, line length, and contrast before shipping a style
            profile into preview artifacts.
          </p>
        </button>
        <div className="ahtml-gallery-typography-sample-grid">
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("fontSans")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Body</p>
            <p
              className="ahtml-gallery-typography-body-copy"
              style={{ fontFamily: profile.globalStyle.typography.fontSans }}
            >
              Dense editor copy should stay stable across toolbar labels, preview
              captions, and form rows without looking decorative.
            </p>
          </button>
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("fontSerif")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Serif</p>
            <p
              className="ahtml-gallery-typography-body-copy"
              style={{ fontFamily: profile.globalStyle.typography.fontSerif }}
            >
              Editorial support faces should hold up in richer preview scenes
              without forcing the whole shell away from utility-first clarity.
            </p>
          </button>
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("fontMono")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Mono</p>
            <p
              className="ahtml-gallery-typography-body-copy"
              style={{ fontFamily: profile.globalStyle.typography.fontMono }}
            >
              Token values, paths, and tool-facing metadata should stay sharp
              and compact when the editor leans into workbench density.
            </p>
          </button>
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("spacing")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Annotation</p>
            <div className="ahtml-gallery-typography-note-stack">
              <span
                className="ahtml-gallery-typography-chip"
                style={{
                  borderRadius: profile.globalStyle.radiusScale.base,
                  background: activeTokens.secondary,
                  color: activeTokens.secondaryForeground,
                }}
              >
                Space {profile.globalStyle.typography.spacing}
              </span>
              <p>
                Tracking, spacing, and radius are read together in pills, labels,
                and popovers across the workbench shell.
              </p>
            </div>
          </button>
        </div>
        <Separator />
        <div className="ahtml-gallery-typography-grid">
          <FieldRow
            label="Font Sans"
            multiline
            value={profile.globalStyle.typography.fontSans}
          />
          <FieldRow
            label="Font Heading"
            multiline
            value={profile.globalStyle.typography.fontHeading}
          />
          <FieldRow
            label="Font Serif"
            multiline
            value={profile.globalStyle.typography.fontSerif}
          />
          <FieldRow
            label="Font Mono"
            multiline
            value={profile.globalStyle.typography.fontMono}
          />
          <FieldRow
            label="Letter Spacing"
            value={profile.globalStyle.typography.letterSpacing}
          />
          <FieldRow
            label="Spacing"
            value={profile.globalStyle.typography.spacing}
          />
          <FieldRow
            label="Radius Base"
            value={profile.globalStyle.radiusScale.base}
          />
        </div>
        <div className="ahtml-gallery-typography-token">
          <code>{`--font-sans: ${profile.globalStyle.typography.fontSans};`}</code>
          <code>{`--font-heading: ${profile.globalStyle.typography.fontHeading};`}</code>
          <code>{`--font-serif: ${profile.globalStyle.typography.fontSerif};`}</code>
          <code>{`--font-mono: ${profile.globalStyle.typography.fontMono};`}</code>
          <code>{`--letter-spacing: ${profile.globalStyle.typography.letterSpacing};`}</code>
          <code>{`--spacing: ${profile.globalStyle.typography.spacing};`}</code>
        </div>
      </div>
    </div>
  )
}

function GalleryColorPreviewPanel({
  onActivateThemeMode,
  onSelectToken,
  profile,
  previewThemeMode,
  themeSyncEnabled,
}: {
  onActivateThemeMode: (mode: GalleryPreviewThemeMode) => void
  onSelectToken: (
    tokenName: ThemeTokenName,
    mode: GalleryPreviewThemeMode,
  ) => void
  profile: StyleProfile
  previewThemeMode: GalleryPreviewThemeMode
  themeSyncEnabled: boolean
}) {
  const previewModes: GalleryPreviewThemeMode[] = ["light", "dark"]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-color-panel">
      <div className="ahtml-gallery-color-content">
        <div className="ahtml-gallery-stage-toolbar">
          <div className="ahtml-gallery-stage-toolbar-copy">
            <span className="ahtml-gallery-stage-panel-kicker">Color palette</span>
            <strong>Semantic token inspection</strong>
          </div>
          <div className="ahtml-gallery-stage-toolbar-meta">
            <GalleryPreviewMeta
              label="Theme"
              value={`${previewThemeMode}${themeSyncEnabled ? " / sync" : ""}`}
            />
            <GalleryPreviewMeta
              label="Primary"
              value={profile.globalStyle.tokenSets[previewThemeMode].primary}
            />
            <GalleryPreviewMeta
              label="Background"
              value={profile.globalStyle.tokenSets[previewThemeMode].background}
            />
          </div>
        </div>
        <div className="ahtml-gallery-color-hero">
          <GalleryPreviewMeta
            label="Theme"
            value={`${previewThemeMode}${themeSyncEnabled ? " / sync" : ""}`}
          />
          <GalleryPreviewMeta
            label="Primary"
            value={profile.globalStyle.tokenSets[previewThemeMode].primary}
          />
          <GalleryPreviewMeta
            label="Background"
            value={profile.globalStyle.tokenSets[previewThemeMode].background}
          />
        </div>
        <div className="ahtml-gallery-color-mode-grid">
          {previewModes.map((mode) => {
            const tokenEntries = Object.entries(
              profile.globalStyle.tokenSets[mode],
            ) as Array<
              [
                keyof StyleProfile["globalStyle"]["tokenSets"]["light"],
                string,
              ]
            >

            return (
              <div
                className={[
                  "ahtml-gallery-color-mode-panel",
                  mode === previewThemeMode ? "is-active" : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={mode}
              >
                <div className="ahtml-gallery-color-mode-header">
                  <div className="ahtml-gallery-color-mode-copy">
                    <span>{mode}</span>
                    <strong>
                      {mode === "light"
                        ? "Editorial light palette"
                        : "Workbench dark palette"}
                    </strong>
                  </div>
                  <Button
                    className="ahtml-gallery-filter-pill"
                    onClick={() => onActivateThemeMode(mode)}
                    size="sm"
                    type="button"
                    variant={mode === previewThemeMode ? "secondary" : "ghost"}
                  >
                    {mode === previewThemeMode ? "Active theme" : "Edit theme"}
                  </Button>
                </div>
                <div className="ahtml-gallery-color-grid">
                  {tokenEntries.map(([tokenName, tokenValue]) => (
                    <button
                      className="ahtml-gallery-color-card"
                      key={`${mode}-${tokenName}`}
                      onClick={() =>
                        onSelectToken(tokenName as ThemeTokenName, mode)
                      }
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="ahtml-gallery-color-card-swatch"
                        style={{ background: tokenValue }}
                      />
                      <div className="ahtml-gallery-color-card-copy">
                        <span>{formatThemeTokenLabel(tokenName)}</span>
                        <strong>{tokenValue}</strong>
                      </div>
                      <span className="ahtml-gallery-color-card-action">
                        {mode === previewThemeMode ? "Edit token" : "Switch + edit"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GalleryCustomPreviewPanel({ profile }: { profile: StyleProfile }) {
  const lightTokens = profile.globalStyle.tokenSets.light
  const darkTokens = profile.globalStyle.tokenSets.dark
  const surfaceShadow = createGallerySurfaceShadow(profile)
  const customPreviewUrl = `https://preview.ahtml.local/${profile.id}`

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-custom-panel">
      <div className="ahtml-gallery-custom-content">
        <div className="ahtml-gallery-custom-browser" data-agent-html-component="frame">
          <div className="ahtml-gallery-custom-preview-toolbar">
            <div className="ahtml-gallery-custom-preview-input">
              <Search aria-hidden="true" className="ahtml-gallery-custom-preview-input-icon" />
              <Input readOnly value={customPreviewUrl} />
              <Button size="sm" type="button" variant="ghost">
                <X aria-hidden="true" />
              </Button>
            </div>
            <div className="ahtml-gallery-custom-preview-actions">
              <Button size="sm" type="button" variant="outline">
                <Shuffle aria-hidden="true" />
              </Button>
              <Button size="sm" type="button" variant="outline">
                <Copy aria-hidden="true" />
              </Button>
              <Button size="sm" type="button" variant="outline">
                <Maximize2 aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="ahtml-gallery-custom-page">
            <div className="ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
              <div className="ahtml-gallery-stage-toolbar-copy">
                <span className="ahtml-gallery-stage-panel-kicker">Custom surface</span>
                <strong>Embedded website preview scene</strong>
              </div>
              <div className="ahtml-gallery-stage-toolbar-meta">
                <GalleryPreviewMeta label="Style" value={profile.id} />
                <GalleryPreviewMeta label="Primary" value={lightTokens.primary} />
                <GalleryPreviewMeta label="Sidebar" value={darkTokens.sidebarPrimary} />
              </div>
            </div>
            <div
              className="ahtml-gallery-custom-preview-empty"
              data-agent-html-component="card"
              data-ahtml-path="manual.custom.empty"
              data-ahtml-render-kind="compound"
              data-ahtml-source="shadcn"
            >
              <div className="ahtml-gallery-custom-preview-empty-icons">
                <div className="ahtml-gallery-custom-preview-empty-icon">
                  <Search aria-hidden="true" />
                </div>
                <X aria-hidden="true" className="ahtml-gallery-custom-preview-empty-separator" />
                <div className="ahtml-gallery-custom-preview-empty-icon">
                  <Inspect aria-hidden="true" />
                </div>
              </div>
              <h4>Preview your Website in tweakcn</h4>
              <div className="ahtml-gallery-custom-preview-steps">
                <div>
                  <strong>1.</strong>
                  <span>Connect a preview target and keep the editor shell in view.</span>
                </div>
                <div>
                  <strong>2.</strong>
                  <span>Use this tab to audit a destination surface, not a component shelf.</span>
                </div>
              </div>
              <div className="ahtml-gallery-custom-preview-guides">
                <button type="button">Script Tag</button>
                <button type="button">Next.js</button>
                <button type="button">Vite</button>
                <button type="button">Remix</button>
              </div>
            </div>
            <div className="ahtml-gallery-custom-connection-status">
              <span className="ahtml-gallery-custom-connection-indicator" aria-hidden="true" />
              <span className="ahtml-gallery-custom-connection-label">Live preview enabled</span>
              <Button size="sm" type="button" variant="outline">
                Retry
              </Button>
            </div>
            <div
              className="ahtml-gallery-custom-site-header"
              data-agent-html-component="card"
              data-ahtml-path="manual.custom.header"
              data-ahtml-render-kind="compound"
              data-ahtml-source="shadcn"
            >
              <div className="ahtml-gallery-custom-site-brand">
                <Badge variant="secondary">Custom Website Preview</Badge>
                <strong>{profile.id}.studio</strong>
              </div>
              <div className="ahtml-gallery-custom-site-nav">
                <span className="is-active">Overview</span>
                <span>Launches</span>
                <span>Insights</span>
                <span>Resources</span>
              </div>
              <div className="ahtml-gallery-custom-site-actions">
                <Badge variant="outline">Live sync</Badge>
                <Button size="sm" type="button">Publish</Button>
              </div>
            </div>
            <div className="ahtml-gallery-custom-stage-grid">
              <section
                className="ahtml-gallery-custom-hero"
                data-agent-html-component="card"
                data-ahtml-path="manual.custom.hero"
                data-ahtml-render-kind="compound"
                data-ahtml-source="shadcn"
                style={{
                  letterSpacing: profile.globalStyle.typography.letterSpacing,
                  gap: `calc(${profile.globalStyle.typography.spacing} * 4)`,
                  boxShadow: surfaceShadow,
                }}
              >
                <div className="ahtml-gallery-custom-hero-copy">
                  <Badge variant="secondary">Editorial system</Badge>
                  <h3 style={{ fontFamily: profile.globalStyle.typography.fontSerif }}>
                    {profile.id} campaign workspace
                  </h3>
                  <p>
                    Build a launch surface where navigation, editorial blocks,
                    and conversion paths all respond to the same token system.
                  </p>
                  <div className="ahtml-gallery-custom-hero-actions">
                    <Button type="button">Open theme</Button>
                    <Button type="button" variant="outline">
                      Review tokens
                    </Button>
                  </div>
                  <div className="ahtml-gallery-custom-stat-strip">
                    {[
                      ["Pipeline", "$184K"],
                      ["Active briefs", "12"],
                      ["Approval", "92%"],
                    ].map(([label, value]) => (
                      <div className="ahtml-gallery-custom-stat" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <Card
                {...getManualCardProps(
                  profile,
                  "manual.custom.side",
                  "ahtml-gallery-custom-card ahtml-gallery-custom-side-card",
                )}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Theme snapshot</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-custom-stack">
                  <div className="ahtml-gallery-custom-swatch-stack">
                    <span style={{ background: lightTokens.primary }} />
                    <span style={{ background: lightTokens.chart2 }} />
                    <span style={{ background: darkTokens.sidebarPrimary }} />
                    <span style={{ background: darkTokens.background }} />
                  </div>
                  <FieldRow label="Primary" value={lightTokens.primary} />
                  <FieldRow label="Sidebar" value={lightTokens.sidebar} />
                  <FieldRow label="Radius" value={profile.globalStyle.radiusScale.base} />
                  <div className="ahtml-gallery-custom-note-list">
                    <span>Cross-surface contrast stays editorial.</span>
                    <span>Navigation and content share one token system.</span>
                    <span>Side panels expose drift faster than isolated cards.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="ahtml-gallery-custom-grid ahtml-gallery-custom-grid-rich">
              <Card
                {...getManualCardProps(
                  profile,
                  "manual.custom.0",
                  "ahtml-gallery-custom-card",
                )}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Ops Review</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-custom-stack">
                  <FieldRow label="Style" value={profile.id} />
                  <FieldRow label="Font Sans" multiline value={profile.globalStyle.typography.fontSans} />
                  <FieldRow label="Font Mono" multiline value={profile.globalStyle.typography.fontMono} />
                </CardContent>
              </Card>
              <Card
                {...getManualCardProps(
                  profile,
                  "manual.custom.1",
                  "ahtml-gallery-custom-card",
                )}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Launch Board</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-custom-stack">
                  <div className="ahtml-gallery-custom-badges">
                    <Badge variant="secondary">review</Badge>
                    <Badge variant="outline">assets</Badge>
                    <Badge variant="outline">handoff</Badge>
                  </div>
                  <div className="ahtml-gallery-custom-progress-list">
                    {[
                      ["Narrative", 84],
                      ["Motion", 61],
                      ["QA", 92],
                    ].map(([label, value]) => (
                      <div className="ahtml-gallery-custom-progress-row" key={label}>
                        <div className="ahtml-gallery-inline-metrics">
                          <span>{label}</span>
                          <strong>{value}%</strong>
                        </div>
                        <Progress value={value as number} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card
                {...getManualCardProps(
                  profile,
                  "manual.custom.2",
                  "ahtml-gallery-custom-card",
                )}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Signal Feed</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-custom-stack">
                  <div className="ahtml-gallery-custom-signal-list">
                    {[
                      "Palette passes accessibility in hero and nav layers.",
                      "Sidebar emphasis reads stronger in dark preview mode.",
                      "Editorial serif stays contained to content-led surfaces.",
                    ].map((item) => (
                      <div className="ahtml-gallery-custom-signal-item" key={item}>
                        <span className="ahtml-gallery-custom-signal-dot" />
                        <p className="ahtml-gallery-custom-copy">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GalleryCardsWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: StyleProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const surfaceShadow = createGallerySurfaceShadow(profile)
  const spacing = profile.globalStyle.typography.spacing

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-stage-toolbar">
        <div className="ahtml-gallery-stage-toolbar-copy">
          <span className="ahtml-gallery-stage-panel-kicker">Cards preview</span>
          <strong>Cards Preview</strong>
        </div>
        <div className="ahtml-gallery-stage-toolbar-meta">
          <GalleryPreviewMeta label="Primary" value={tokens.primary} />
          <GalleryPreviewMeta label="Muted" value={tokens.muted} />
          <GalleryPreviewMeta label="Spacing" value={spacing} />
        </div>
      </div>
      <div className="ahtml-gallery-cards-workbench">
        <div className="ahtml-gallery-cards-column ahtml-gallery-cards-column-primary">
          <Card
            {...getManualCardProps(profile, "manual.cards.0")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Revenue Pulse</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <div className="ahtml-gallery-inline-metrics">
                <strong>$94.8K</strong>
                <Badge variant="secondary">+14%</Badge>
              </div>
              <Progress value={74} />
              <p className="ahtml-gallery-custom-copy">
                Compact KPI cards should hold number, movement, and action state
                without turning into dashboard chrome.
              </p>
            </CardContent>
          </Card>
          <div className="ahtml-gallery-cards-split">
            <Card
              {...getManualCardProps(profile, "manual.cards.1")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Calendar Sync</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <div className="ahtml-gallery-mini-calendar">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                  {Array.from({ length: 14 }, (_, index) => (
                    <span
                      className={index === 8 ? "is-active" : undefined}
                      key={index}
                    >
                      {index + 9}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card
              {...getManualCardProps(profile, "manual.cards.2")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Activity Goal</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <strong className="ahtml-gallery-goal-number">82%</strong>
                <Slider
                  aria-label="Activity goal"
                  defaultValue={[82]}
                  max={100}
                  step={1}
                />
              </CardContent>
            </Card>
          </div>
          <Card
            {...getManualCardProps(profile, "manual.cards.7")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <Input readOnly value="name@agent-html.dev" />
              <Input readOnly value="Create a password" />
              <div className="ahtml-gallery-inline-metrics">
                <Badge variant="outline">OAuth</Badge>
                <Button size="sm" type="button">Continue</Button>
              </div>
            </CardContent>
          </Card>
          <Card
            {...getManualCardProps(profile, "manual.cards.3")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Cookie Settings</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-toggle-list">
              <label>
                <span>Strictly necessary</span>
                <Switch checked />
              </label>
              <label>
                <span>Product analytics</span>
                <Switch checked={previewThemeMode === "light"} />
              </label>
              <label>
                <span>Personalization</span>
                <Switch />
              </label>
            </CardContent>
          </Card>
        </div>
        <div className="ahtml-gallery-cards-column">
          <Card
            {...getManualCardProps(profile, "manual.cards.6")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Surface Audit</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <div className="ahtml-gallery-custom-badges">
                <Badge variant="outline">Embed</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="secondary">Preview</Badge>
              </div>
              <Separator />
              <p className="ahtml-gallery-custom-copy">
                Tweakcn&apos;s cards area feels like a collage, not a linear design
                system table.
              </p>
              <FieldRow label="Treatment" value={profile.componentStyle.treatments.card ?? "none"} />
            </CardContent>
          </Card>
          <div className="ahtml-gallery-cards-split ahtml-gallery-cards-split-tight">
            <Card
              {...getManualCardProps(profile, "manual.cards.4")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-chat-thread">
                <div>
                  <strong>Mia</strong>
                  <p>Can the gallery feel more like a product editor?</p>
                </div>
                <div className="is-reply">
                  <strong>You</strong>
                  <p>
                    The shell is close. The remaining gap is preview fidelity and
                    denser component composition.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              {...getManualCardProps(profile, "manual.cards.5")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Issue Report</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <Input value="Unexpected spacing drift" readOnly />
                <Textarea
                  readOnly
                  value="Cards preview still needs more asymmetric collage behavior to feel like tweakcn."
                />
              </CardContent>
            </Card>
          </div>
          <Card
            {...getManualCardProps(profile, "manual.cards.8")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-member-list">
              {[
                ["Alicia", "Design review"],
                ["Noah", "Runtime QA"],
                ["Mia", "Preview shell"],
              ].map(([name, role]) => (
                <div className="ahtml-gallery-member-row" key={name}>
                  <div className="ahtml-gallery-member-avatar" aria-hidden="true">
                    {name.slice(0, 1)}
                  </div>
                  <div className="ahtml-gallery-member-copy">
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                  <Badge variant="outline">online</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card
            {...getManualCardProps(profile, "manual.cards.9")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Share this document</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <p className="ahtml-gallery-custom-copy">
                Anyone with the link can view this document.
              </p>
              <div className="ahtml-gallery-inline-metrics">
                <Input readOnly value="http://example.com/link/to/document" />
                <Button size="sm" type="button" variant="outline">
                  Copy Link
                </Button>
              </div>
              <Separator />
              <div className="ahtml-gallery-member-list">
                {[
                  ["Olivia", "m@example.com", "Can edit"],
                  ["Isabella", "b@example.com", "Can view"],
                ].map(([name, email, access]) => (
                  <div className="ahtml-gallery-member-row" key={email}>
                    <div className="ahtml-gallery-member-avatar" aria-hidden="true">
                      {name.slice(0, 1)}
                    </div>
                    <div className="ahtml-gallery-member-copy">
                      <strong>{name}</strong>
                      <span>{email}</span>
                    </div>
                    <Badge variant={access === "Can edit" ? "secondary" : "outline"}>
                      {access}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="ahtml-gallery-workbench-footer">
        <FieldRow label="Primary" value={tokens.primary} />
        <FieldRow label="Muted" value={tokens.muted} />
        <FieldRow label="Spacing" value={spacing} />
        <FieldRow label="Border" value={tokens.border} />
      </div>
    </div>
  )
}

function GalleryDashboardWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: StyleProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const chartTokens = [
    tokens.chart1,
    tokens.chart2,
    tokens.chart3,
    tokens.chart4,
    tokens.chart5,
  ]
  const surfaceShadow = createGallerySurfaceShadow(profile)

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-dashboard-shell">
        <aside
          className="ahtml-gallery-dashboard-sidebar"
          style={{
            background: tokens.sidebar,
            color: tokens.sidebarForeground,
            borderColor: tokens.sidebarBorder,
          }}
        >
          <strong>Acme Ops</strong>
          <div className="ahtml-gallery-dashboard-nav-group">
            <span className="is-active">Overview</span>
            <span>Revenue</span>
            <span>Operations</span>
            <span>Settings</span>
          </div>
          <Separator />
          <div className="ahtml-gallery-dashboard-nav-group">
            <span>Retention</span>
            <span>Channels</span>
            <span>Exports</span>
          </div>
          <Badge
            style={{
              background: tokens.sidebarPrimary,
              color: tokens.sidebarPrimaryForeground,
            }}
            variant="secondary"
          >
            Live sync
          </Badge>
        </aside>
        <div className="ahtml-gallery-dashboard-main">
          <header className="ahtml-gallery-dashboard-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div>
              <span className="ahtml-gallery-stage-panel-kicker">Acme Inc.</span>
              <h4>Dashboard</h4>
            </div>
            <div className="ahtml-gallery-stage-toolbar-meta">
              <GalleryPreviewMeta label="Primary" value={tokens.primary} />
              <GalleryPreviewMeta label="Sidebar" value={tokens.sidebarPrimary} />
              <GalleryPreviewMeta label="Chart 1" value={tokens.chart1} />
            </div>
          </header>
          <div className="ahtml-gallery-dashboard-section-cards">
            {[
              ["MRR", "$124K"],
              ["Expansion", "+12.4%"],
              ["Active users", "8,420"],
              ["NPS", "61"],
            ].map(([label, value]) => (
              <Card
                {...getManualCardProps(profile, `manual.dashboard.metric.${label}`)}
                key={label}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <strong className="ahtml-gallery-goal-number">{value}</strong>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card
            {...getManualCardProps(profile, "manual.dashboard.chart")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <div className="ahtml-gallery-inline-metrics">
                <CardTitle>Interactive area chart</CardTitle>
                <div className="ahtml-gallery-custom-badges">
                  <Badge variant="outline">Quarterly</Badge>
                  <Badge variant="secondary">Live</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="ahtml-gallery-chart-bars">
                {[48, 72, 65, 90, 82, 96, 68, 88].map((value, index) => (
                  <span
                    key={index}
                    style={{
                      height: `${value}%`,
                      background: chartTokens[index % chartTokens.length],
                    }}
                  />
                ))}
              </div>
              <div className="ahtml-gallery-dashboard-chart-footer">
                <FieldRow label="Goal" value="$200K" />
                <FieldRow label="Window" value="Last 90 days" />
              </div>
            </CardContent>
          </Card>
          <div className="ahtml-gallery-dashboard-lower">
            <Card
              {...getManualCardProps(profile, "manual.dashboard.table")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Review queue</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Platform", "Ready", "Noah"],
                      ["Docs", "Review", "Alicia"],
                      ["Design", "Synced", "Mia"],
                    ].map(([team, status, owner]) => (
                      <TableRow key={team}>
                        <TableCell>{team}</TableCell>
                        <TableCell>{status}</TableCell>
                        <TableCell>{owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="ahtml-gallery-dashboard-secondary-stack">
              <Card
                {...getManualCardProps(profile, "manual.dashboard.tokens")}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Token snapshot</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-custom-stack">
                  <FieldRow label="Primary" value={tokens.primary} />
                  <FieldRow label="Accent" value={tokens.accent} />
                  <FieldRow label="Sidebar primary" value={tokens.sidebarPrimary} />
                  <FieldRow label="Background" value={tokens.background} />
                </CardContent>
              </Card>
              <Card
                {...getManualCardProps(profile, "manual.dashboard.mix")}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Channel Mix</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-dashboard-mix-card">
                  <div
                    className="ahtml-gallery-dashboard-donut"
                    style={{
                      background: `conic-gradient(${tokens.chart1} 0 34%, ${tokens.chart2} 34% 62%, ${tokens.chart3} 62% 82%, ${tokens.chart4} 82% 100%)`,
                    }}
                  />
                  <div className="ahtml-gallery-dashboard-mix-list">
                    {[
                      ["Search", "34%"],
                      ["Direct", "28%"],
                      ["Email", "20%"],
                      ["Partners", "18%"],
                    ].map(([label, value]) => (
                      <div className="ahtml-gallery-inline-metrics" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GalleryMailWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: StyleProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-mail-shell">
        <aside
          className="ahtml-gallery-mail-nav"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.nav"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
          style={{
            background: tokens.sidebar,
            color: tokens.sidebarForeground,
            borderColor: tokens.sidebarBorder,
          }}
        >
          <Button type="button">Compose</Button>
          <Input readOnly value="Search inbox" />
          <div className="ahtml-gallery-mail-nav-links">
            <span className="is-active">Inbox 128</span>
            <span>Drafts 9</span>
            <span>Sent</span>
            <span>Archive 23</span>
            <span>Later</span>
          </div>
          <div className="ahtml-gallery-custom-badges">
            <Badge variant="secondary">All mail</Badge>
            <Badge variant="outline">Unread 12</Badge>
          </div>
        </aside>
        <section
          className="ahtml-gallery-mail-list"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.list"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
        >
          <div className="ahtml-gallery-mail-list-header">
            <div className="ahtml-gallery-inline-metrics">
              <h5>Inbox</h5>
              <div className="ahtml-gallery-mail-tab-pills">
                <Badge variant="secondary">All mail</Badge>
                <Badge variant="outline">Unread</Badge>
              </div>
            </div>
            <div className="ahtml-gallery-mail-search-wrap">
              <Search aria-hidden="true" className="ahtml-gallery-mail-search-icon" />
              <Input readOnly value="Search" />
            </div>
          </div>
          <div className="ahtml-gallery-mail-list-toolbar">
            <Badge variant="secondary">Focused</Badge>
            <Badge variant="outline">Today</Badge>
          </div>
          {[
            ["Mia Chen", "Gallery alignment review", "Needs reply", "Preview shell is aligned. Remaining work is matching the denser work-app rhythm.", "09:12"],
            ["Alicia Gomez", "Palette review ready", "Unread", "Dark mode sidebar tokens are finally reading like a real product surface.", "08:41"],
            ["Noah Patel", "Mail preview references", "Pinned", "Collected structural refs from tweakcn mail and dashboard examples.", "Yesterday"],
          ].map(([author, subject, state, snippet, time], index) => (
            <button
              className={[
                "ahtml-gallery-mail-list-item",
                index === 0 ? "is-active" : null,
              ]
                .filter(Boolean)
                .join(" ")}
              key={author}
              type="button"
            >
              <div className="ahtml-gallery-inline-metrics">
                <strong>{author}</strong>
                <span>{time}</span>
              </div>
              <span>{subject}</span>
              <p>{snippet}</p>
              <Badge variant={index === 0 ? "secondary" : "outline"}>{state}</Badge>
            </button>
          ))}
        </section>
        <article
          className="ahtml-gallery-mail-display"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.display"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
          style={{ letterSpacing: profile.globalStyle.typography.letterSpacing }}
        >
          <header className="ahtml-gallery-mail-display-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div>
              <span className="ahtml-gallery-stage-panel-kicker">Mail preview</span>
              <h4>Gallery alignment review</h4>
              <p>From Mia Chen · Theme {profile.id}</p>
            </div>
            <div className="ahtml-gallery-stage-toolbar-meta">
              <GalleryPreviewMeta label="Primary" value={tokens.primary} />
              <GalleryPreviewMeta label="Sidebar" value={tokens.sidebar} />
              <GalleryPreviewMeta
                label="Mono"
                value={extractFontName(profile.globalStyle.typography.fontMono)}
              />
            </div>
          </header>
          <div className="ahtml-gallery-mail-display-actions">
            <Badge variant="outline">Reply</Badge>
            <Badge variant="outline">Archive</Badge>
            <Badge variant="secondary">Assigned</Badge>
          </div>
          <div className="ahtml-gallery-mail-display-body">
            <p>
              Preview shell is aligned. Remaining work is matching the denser
              work-app rhythm from tweakcn and reducing synthetic layout feeling.
            </p>
            <p>
              Focus on the inbox/list/detail relationship and keep the tool feel
              closer to an app than to a component catalog.
            </p>
            <div className="ahtml-gallery-mail-quote">
              <strong>Quoted context</strong>
              <p>
                Current workbench shell is substantially closer. Remaining drift
                comes from preview surfaces still reading as handcrafted demos
                instead of product-native examples.
              </p>
            </div>
            <div className="ahtml-gallery-mail-attachments">
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>design.md</strong>
                <span>Visual gap notes</span>
              </div>
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>gallery.md</strong>
                <span>Product standard</span>
              </div>
            </div>
          </div>
          <Textarea
            readOnly
            value={`Reply draft\n\nPrimary ${tokens.primary}\nSidebar ${tokens.sidebar}\nMono ${profile.globalStyle.typography.fontMono}\nRadius ${profile.globalStyle.radiusScale.base}`}
          />
          <div className="ahtml-gallery-inline-metrics">
            <Badge variant="outline">⌘ Enter to send</Badge>
            <Button size="sm" type="button">Send draft</Button>
          </div>
        </article>
      </div>
    </div>
  )
}

function GalleryPricingWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: StyleProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const surfaceShadow = createGallerySurfaceShadow(profile)

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-stage-toolbar">
        <div className="ahtml-gallery-stage-toolbar-copy">
          <span className="ahtml-gallery-stage-panel-kicker">Pricing preview</span>
          <strong>Marketing block inside the editor stage</strong>
        </div>
        <div className="ahtml-gallery-stage-toolbar-meta">
          <GalleryPreviewMeta label="Primary" value={tokens.primary} />
          <GalleryPreviewMeta label="Secondary" value={tokens.secondary} />
          <GalleryPreviewMeta label="Style" value={profile.id} />
        </div>
      </div>
      <div className="ahtml-gallery-pricing-shell">
        <div className="ahtml-gallery-pricing-header">
          <h4>Pricing</h4>
          <p>Check out affordable plans without leaving the preview workbench.</p>
          <div className="ahtml-gallery-pricing-toggle">
            <span>Monthly</span>
            <Switch checked={previewThemeMode === "dark"} />
            <span>Yearly</span>
          </div>
        </div>
        <div className="ahtml-gallery-pricing-grid">
          {[
            ["Plus", "$19", "For personal use", "outline"],
            ["Pro", "$49", "For professionals", "secondary"],
          ].map(([name, price, description, badgeVariant]) => (
            <Card
              {...getManualCardProps(profile, `manual.pricing.${name}`)}
              key={name}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <div className="ahtml-gallery-inline-metrics">
                  <CardTitle>{name}</CardTitle>
                  <Badge variant={badgeVariant as "outline" | "secondary"}>
                    {name === "Pro" ? "popular" : "solo"}
                  </Badge>
                </div>
                <p className="ahtml-gallery-custom-copy">{description}</p>
                <strong className="ahtml-gallery-goal-number">{price}</strong>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <Separator />
                <div className="ahtml-gallery-feature-list">
                  <label><Checkbox checked /> Shared presets</label>
                  <label><Checkbox checked /> Gallery preview</label>
                  <label><Checkbox checked={name === "Pro"} /> Priority support</label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="ahtml-gallery-workbench-footer">
          <FieldRow label="Primary" value={tokens.primary} />
          <FieldRow label="Secondary" value={tokens.secondary} />
          <FieldRow label="Spacing" value={profile.globalStyle.typography.spacing} />
          <FieldRow label="Style" value={profile.id} />
        </div>
      </div>
    </div>
  )
}

function collectInspectorSourceTokens(target: HTMLElement) {
  const values = [
    target.dataset.ahtmlTreatment,
    target.dataset.ahtmlSource,
    target.dataset.ahtmlRenderKind,
    target.dataset.slot,
    target.getAttribute("data-slot") ?? undefined,
  ]

  return Array.from(new Set(values.filter(Boolean) as string[]))
}

function resolveFocusableThemeToken(token: string): ThemeTokenName | null {
  const normalizedToken = token
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase()

  for (const [sourceToken, tokenName] of focusableThemeTokenEntries) {
    const matcher = new RegExp(
      `(^|[^a-z0-9-])${escapeRegExp(sourceToken)}($|[^a-z0-9-])`,
    )

    if (matcher.test(normalizedToken)) {
      return tokenName
    }
  }

  return null
}

function getColorSectionIdForToken(tokenName: ThemeTokenName) {
  return (
    colorTokenSections.find((section) => section.tokenNames.includes(tokenName))
      ?.id ?? "base-tokens"
  )
}

function isBuiltInStyleReference(styleReference: string) {
  return styleReference === "report-default"
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function createGallerySurfaceShadow(styleProfile: ArtifactProfile) {
  const typography = styleProfile.globalStyle.typography

  return `${typography.shadowOffsetX} ${typography.shadowOffsetY} ${typography.shadowBlur} ${typography.shadowSpread} color-mix(in srgb, ${typography.shadowColor} calc(${typography.shadowOpacity} * 100%), transparent)`
}

function createDocumentStyleCss(styleProfile: ArtifactProfile) {
  const globalStyle = styleProfile.globalStyle

  return [
    `:root{${createGlobalStyleDeclarations(globalStyle, "light")}}`,
    `@media (prefers-color-scheme: dark){:root{${createGlobalStyleDeclarations(
      globalStyle,
      "dark",
    )}}}`,
  ].join("")
}

function createGalleryPreviewThemeCss(styleProfile: ArtifactProfile) {
  return [
    `.ahtml-gallery-preview-surface[data-theme-mode="light"]{${createGlobalStyleDeclarations(
      styleProfile.globalStyle,
      "light",
    )}}`,
    `.ahtml-gallery-preview-surface[data-theme-mode="dark"]{${createGlobalStyleDeclarations(
      styleProfile.globalStyle,
      "dark",
    )}}`,
  ].join("")
}

function createGlobalStyleDeclarations(
  globalStyle: ArtifactProfile["globalStyle"],
  mode: "light" | "dark",
) {
  return [
    `${globalStyle.cssVariableMap.background}:${globalStyle.tokenSets[mode].background};`,
    `${globalStyle.cssVariableMap.foreground}:${globalStyle.tokenSets[mode].foreground};`,
    `${globalStyle.cssVariableMap.card}:${globalStyle.tokenSets[mode].card};`,
    `${globalStyle.cssVariableMap.cardForeground}:${globalStyle.tokenSets[mode].cardForeground};`,
    `${globalStyle.cssVariableMap.popover}:${globalStyle.tokenSets[mode].popover};`,
    `${globalStyle.cssVariableMap.popoverForeground}:${globalStyle.tokenSets[mode].popoverForeground};`,
    `${globalStyle.cssVariableMap.primary}:${globalStyle.tokenSets[mode].primary};`,
    `${globalStyle.cssVariableMap.primaryForeground}:${globalStyle.tokenSets[mode].primaryForeground};`,
    `${globalStyle.cssVariableMap.secondary}:${globalStyle.tokenSets[mode].secondary};`,
    `${globalStyle.cssVariableMap.secondaryForeground}:${globalStyle.tokenSets[mode].secondaryForeground};`,
    `${globalStyle.cssVariableMap.muted}:${globalStyle.tokenSets[mode].muted};`,
    `${globalStyle.cssVariableMap.mutedForeground}:${globalStyle.tokenSets[mode].mutedForeground};`,
    `${globalStyle.cssVariableMap.accent}:${globalStyle.tokenSets[mode].accent};`,
    `${globalStyle.cssVariableMap.accentForeground}:${globalStyle.tokenSets[mode].accentForeground};`,
    `${globalStyle.cssVariableMap.destructive}:${globalStyle.tokenSets[mode].destructive};`,
    `${globalStyle.cssVariableMap.destructiveForeground}:${globalStyle.tokenSets[mode].destructiveForeground};`,
    `${globalStyle.cssVariableMap.border}:${globalStyle.tokenSets[mode].border};`,
    `${globalStyle.cssVariableMap.input}:${globalStyle.tokenSets[mode].input};`,
    `${globalStyle.cssVariableMap.ring}:${globalStyle.tokenSets[mode].ring};`,
    `${globalStyle.cssVariableMap.chart1}:${globalStyle.tokenSets[mode].chart1};`,
    `${globalStyle.cssVariableMap.chart2}:${globalStyle.tokenSets[mode].chart2};`,
    `${globalStyle.cssVariableMap.chart3}:${globalStyle.tokenSets[mode].chart3};`,
    `${globalStyle.cssVariableMap.chart4}:${globalStyle.tokenSets[mode].chart4};`,
    `${globalStyle.cssVariableMap.chart5}:${globalStyle.tokenSets[mode].chart5};`,
    `${globalStyle.cssVariableMap.sidebar}:${globalStyle.tokenSets[mode].sidebar};`,
    `${globalStyle.cssVariableMap.sidebarForeground}:${globalStyle.tokenSets[mode].sidebarForeground};`,
    `${globalStyle.cssVariableMap.sidebarPrimary}:${globalStyle.tokenSets[mode].sidebarPrimary};`,
    `${globalStyle.cssVariableMap.sidebarPrimaryForeground}:${globalStyle.tokenSets[mode].sidebarPrimaryForeground};`,
    `${globalStyle.cssVariableMap.sidebarAccent}:${globalStyle.tokenSets[mode].sidebarAccent};`,
    `${globalStyle.cssVariableMap.sidebarAccentForeground}:${globalStyle.tokenSets[mode].sidebarAccentForeground};`,
    `${globalStyle.cssVariableMap.sidebarBorder}:${globalStyle.tokenSets[mode].sidebarBorder};`,
    `${globalStyle.cssVariableMap.sidebarRing}:${globalStyle.tokenSets[mode].sidebarRing};`,
    `${globalStyle.cssVariableMap.radius}:${globalStyle.radiusScale.base};`,
    `${globalStyle.cssVariableMap.fontSans}:${globalStyle.typography.fontSans};`,
    `${globalStyle.cssVariableMap.fontHeading}:${globalStyle.typography.fontHeading};`,
    `${globalStyle.cssVariableMap.fontSerif}:${globalStyle.typography.fontSerif};`,
    `${globalStyle.cssVariableMap.fontMono}:${globalStyle.typography.fontMono};`,
    `${globalStyle.cssVariableMap.letterSpacing}:${globalStyle.typography.letterSpacing};`,
    `${globalStyle.cssVariableMap.spacing}:${globalStyle.typography.spacing};`,
    `${globalStyle.cssVariableMap.shadowColor}:${globalStyle.typography.shadowColor};`,
    `${globalStyle.cssVariableMap.shadowOpacity}:${globalStyle.typography.shadowOpacity};`,
    `${globalStyle.cssVariableMap.shadowBlur}:${globalStyle.typography.shadowBlur};`,
    `${globalStyle.cssVariableMap.shadowSpread}:${globalStyle.typography.shadowSpread};`,
    `${globalStyle.cssVariableMap.shadowOffsetX}:${globalStyle.typography.shadowOffsetX};`,
    `${globalStyle.cssVariableMap.shadowOffsetY}:${globalStyle.typography.shadowOffsetY};`,
    `color-scheme:${mode};`,
  ].join("")
}

function createRuntimeHostCss() {
  return `
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 12%, transparent), transparent 32%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 96%, black 4%), var(--background));
      color: var(--foreground);
      font-family: var(--font-sans);
      letter-spacing: var(--letter-spacing);
    }
    .ahtml-runtime-host {
      min-height: 100vh;
      box-sizing: border-box;
    }
  `
}

function createArtifactShellCss() {
  return `
    .ahtml-artifact-root {
      box-sizing: border-box;
      display: grid;
    }
    .ahtml-artifact-root > * {
      min-width: 0;
    }
    .ahtml-artifact-root [data-agent-html-component="page"] > * {
      min-width: 0;
    }
  `
}

function createDocumentLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-document {
      width: min(100%, 72rem);
      margin: 0 auto;
      padding: 4rem 1.25rem 5rem;
      gap: 2rem;
    }
    .ahtml-layout-policy-document .ahtml-prose-block {
      max-width: 68ch;
    }
    .ahtml-layout-policy-document .ahtml-prose-block > p {
      line-height: 1.75;
    }
    .ahtml-layout-policy-document .ahtml-prose-inline {
      line-height: 1.65;
    }
    .ahtml-layout-policy-document .ahtml-section-stack {
      display: grid;
      gap: 1.35rem;
    }
    .ahtml-layout-policy-document [data-slot="card-content"].ahtml-section-stack > :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) + :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) {
      margin-top: 0;
    }
    @media (max-width: 1100px) {
      .ahtml-layout-policy-document {
        width: min(100%, 60rem);
        padding: 2.75rem 1rem 3.5rem;
        gap: 1.5rem;
      }
    }
    @media (min-width: 1200px) {
      .ahtml-layout-policy-document {
        width: min(100%, 76rem);
        padding-top: 4.5rem;
      }
    }
  `
}

function createGalleryLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-gallery {
      width: 100%;
      padding: 0;
      grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
      gap: 1.25rem;
      align-items: start;
    }
    .ahtml-layout-policy-gallery > * {
      min-width: 0;
    }
  `
}

function createGalleryShellCss() {
  return `
    .ahtml-gallery-shell {
      display: grid;
      min-height: 100vh;
      grid-template-rows: auto auto minmax(0, 1fr);
      box-sizing: border-box;
      background: var(--background);
    }
    .ahtml-gallery-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
      min-height: 3.5rem;
      padding: 0.7rem 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: var(--background);
    }
    .ahtml-gallery-page-brand {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      min-width: 0;
    }
    .ahtml-gallery-page-brand strong {
      font-family: var(--font-heading);
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-page-brand span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .ahtml-gallery-header-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: 0.75rem;
    }
    .ahtml-gallery-mobile-tabs {
      display: none;
      padding: 0.6rem 1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-mobile-tabs-list {
      width: 100%;
      border-radius: 0;
      justify-content: flex-start;
      gap: 0.2rem;
      padding: 0;
      background: transparent;
    }
    .ahtml-gallery-mobile-tabs-trigger {
      flex: 1;
      justify-content: center;
    }
    .ahtml-gallery-main {
      display: flex;
      min-height: 0;
      min-width: 0;
      position: relative;
    }
    .ahtml-gallery-sidebar {
      width: min(31rem, 33vw);
      min-width: 20rem;
      overflow: hidden;
    }
    .ahtml-gallery-divider {
      width: 0.75rem;
      flex: none;
      border-left: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%),
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%)
        );
      cursor: col-resize;
    }
    .ahtml-gallery-sidebar-inner {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .ahtml-gallery-control-header {
      display: grid;
      gap: 0;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-control-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      flex-wrap: wrap;
      min-width: 0;
    }
    .ahtml-gallery-control-header-row + .ahtml-gallery-control-header-row {
      border-top: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    }
    .ahtml-gallery-control-header-row-tabs {
      align-items: flex-end;
    }
    .ahtml-gallery-preset-rail {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 3.5rem;
      padding: 0.7rem 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preset-copy {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 0;
      flex: 1;
    }
    .ahtml-gallery-preset-workbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-preset-rail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      min-width: 0;
    }
    .ahtml-gallery-preset-rail-status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-preset-inline-status {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-left: auto;
    }
    .ahtml-gallery-preset-select-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
      flex-wrap: nowrap;
    }
    .ahtml-gallery-preset-popover-trigger {
      min-width: min(100%, 18rem);
      max-width: 100%;
      height: auto;
      justify-content: flex-start;
      gap: 0.8rem;
      padding: 0.45rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-preset-popover-trigger:hover {
      background: color-mix(in srgb, var(--background) 92%, var(--muted) 8%);
    }
    .ahtml-gallery-preset-trigger-copy {
      display: grid;
      min-width: 0;
      text-align: left;
      gap: 0.12rem;
      flex: 1;
    }
    .ahtml-gallery-preset-trigger-copy strong {
      line-height: 1.25;
    }
    .ahtml-gallery-preset-trigger-copy span {
      color: var(--muted-foreground);
      font-size: 0.7rem;
      line-height: 1.3;
    }
    .ahtml-gallery-preset-chevron {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-preset-swatch-row,
    .ahtml-gallery-preset-option-swatch-row {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex: none;
    }
    .ahtml-gallery-preset-swatch {
      width: 0.72rem;
      height: 0.72rem;
      border-radius: 0.28rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, white 18%, transparent);
    }
    .ahtml-gallery-preset-inline-tools {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.18rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-preset-inline-tools [data-slot="button"] {
      min-width: 2rem;
      padding-inline: 0.5rem;
      border-radius: 999px;
    }
    .ahtml-gallery-preset-select {
      min-width: min(100%, 16rem);
      max-width: 100%;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      border-color: color-mix(in srgb, var(--border) 80%, transparent);
    }
    .ahtml-gallery-preset-popover {
      width: min(30rem, calc(100vw - 2rem));
      padding: 0.75rem;
      gap: 0.75rem;
    }
    .ahtml-gallery-preset-search-wrap {
      margin-top: 0.1rem;
    }
    .ahtml-gallery-preset-search-field {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.15rem 0.2rem 0.15rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 1);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preset-search-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-preset-search-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-preset-search-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-preset-popover-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.45rem;
    }
    .ahtml-gallery-preset-popover-stat {
      display: grid;
      gap: 0.16rem;
      padding: 0.55rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      min-width: 0;
    }
    .ahtml-gallery-preset-popover-stat span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .ahtml-gallery-preset-popover-stat strong {
      line-height: 1.35;
      word-break: break-word;
    }
    .ahtml-gallery-preset-list-scroll {
      max-height: 18rem;
    }
    .ahtml-gallery-preset-list {
      display: grid;
      gap: 0.35rem;
      padding-right: 0.25rem;
    }
    .ahtml-gallery-preset-group {
      display: grid;
      gap: 0.35rem;
    }
    .ahtml-gallery-preset-group + .ahtml-gallery-preset-group {
      margin-top: 0.35rem;
      padding-top: 0.55rem;
      border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-preset-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      color: var(--muted-foreground);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preset-option {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      width: 100%;
      padding: 0.6rem 0.65rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.95);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-preset-option:hover,
    .ahtml-gallery-preset-option.is-active {
      border-color: color-mix(in srgb, var(--border) 76%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-preset-option.is-active {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-preset-option-copy {
      display: grid;
      min-width: 0;
      flex: 1;
      gap: 0.18rem;
    }
    .ahtml-gallery-preset-option-copy-top {
      display: grid;
      gap: 0.08rem;
    }
    .ahtml-gallery-preset-option-copy strong {
      line-height: 1.25;
    }
    .ahtml-gallery-preset-option-kicker {
      color: var(--muted-foreground);
      font-size: 0.76rem;
      line-height: 1.35;
    }
    .ahtml-gallery-preset-option-copy-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preset-option-status {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.35rem;
      flex-wrap: wrap;
      flex: none;
    }
    .ahtml-gallery-preset-empty {
      padding: 0.75rem 0.2rem;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-preset-meta {
      display: grid;
      gap: 0.35rem;
      min-width: 8.5rem;
      justify-items: start;
    }
    .ahtml-gallery-preset-footnote {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.68rem;
      line-height: 1.35;
      min-width: 0;
    }
    .ahtml-gallery-preset-footnote span:last-child {
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }
    .ahtml-gallery-section-kicker {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-title {
      margin: 0;
      font-family: var(--font-heading);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-preview-title {
      font-size: 1rem;
      line-height: 1.2;
    }
    .ahtml-gallery-meta,
    .ahtml-gallery-preview-note,
    .ahtml-gallery-toolbar-caption {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-section-note {
      margin: 0 0 0.2rem;
      color: color-mix(in srgb, var(--muted-foreground) 82%, transparent);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .ahtml-gallery-control-tabs {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
    }
    .ahtml-gallery-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
    }
    .ahtml-gallery-toolbar-border {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-toolbar-copy {
      display: grid;
      gap: 0.12rem;
      min-width: 0;
    }
    .ahtml-gallery-toolbar-label {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-toolbar-caption {
      font-size: 0.76rem;
    }
    .ahtml-gallery-pill-tabs {
      width: fit-content;
      gap: 0.15rem;
      padding: 0;
      border-radius: 999px;
      background: transparent;
    }
    .ahtml-gallery-tabs-trigger-pill {
      height: auto;
      flex: none;
      border-radius: 999px;
      padding: 0.32rem 0.86rem;
      border: 1px solid transparent;
      color: color-mix(in srgb, var(--foreground) 62%, var(--muted-foreground) 38%);
      background: transparent;
      box-shadow: none;
      transition:
        background-color 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-tabs-trigger-pill:hover {
      color: var(--foreground);
      background: color-mix(in srgb, var(--muted) 68%, transparent);
    }
    .ahtml-gallery-tabs-trigger-pill[data-state="active"] {
      border-color: color-mix(in srgb, var(--border) 80%, transparent);
      background: color-mix(in srgb, var(--secondary) 84%, transparent);
      color: var(--secondary-foreground);
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--foreground) 5%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 35%, transparent);
    }
    .ahtml-gallery-pill-scroll {
      width: auto;
      max-width: 100%;
      white-space: nowrap;
    }
    .ahtml-gallery-pill-scroll [data-slot="scroll-area-viewport"] > div {
      display: inline-flex !important;
    }
    .ahtml-gallery-control-body {
      min-height: 0;
      flex: 1;
      overflow: auto;
    }
    .ahtml-gallery-control-filter-bar {
      display: grid;
      gap: 0.55rem;
      padding: 0.6rem 1rem 0.4rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    }
    .ahtml-gallery-control-filter-field {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      padding: 0.15rem 0.2rem 0.15rem 0.6rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-control-filter-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-control-filter-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-control-filter-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-control-filter-clear {
      flex: none;
      min-width: 1.75rem;
      padding-inline: 0.35rem;
    }
    .ahtml-gallery-control-filter-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-filter-actions {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.3rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-filter-pill {
      min-height: 1.7rem;
      border-radius: 999px;
      padding-inline: 0.55rem;
      font-size: 0.66rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-empty {
      padding: 1rem;
      color: var(--muted-foreground);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .ahtml-gallery-tab-panel {
      margin-top: 0;
      height: 100%;
    }
    .ahtml-gallery-control-sections {
      display: grid;
      gap: 0;
      padding: 0 0.9rem 0.9rem;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-item"] {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      padding: 0.12rem 0;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] {
      width: fit-content;
      padding: 0.08rem 0;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      text-decoration: none;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] > span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border-radius: calc(var(--radius) * 0.72);
      border: 1px solid transparent;
      background: color-mix(in srgb, var(--muted) 62%, transparent);
      padding: 0.22rem 0.5rem;
      transition:
        border-color 160ms ease,
        background-color 160ms ease,
        color 160ms ease;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"]:hover > span {
      border-color: color-mix(in srgb, var(--border) 74%, transparent);
      background: color-mix(in srgb, var(--muted) 78%, transparent);
      color: var(--foreground);
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"][data-state="open"] > span {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 84%, transparent);
      color: var(--foreground);
      box-shadow: inset 0 1px 0 color-mix(in srgb, white 25%, transparent);
    }
    .ahtml-gallery-panel-body {
      padding: 0.14rem 0 0.48rem;
    }
    .ahtml-gallery-stack {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
    }
    .ahtml-gallery-control-row,
    .ahtml-gallery-field-row {
      display: grid;
      grid-template-columns: minmax(0, 5.4rem) minmax(0, 1fr);
      align-items: center;
      gap: 0.48rem;
      padding: 0.12rem 0;
    }
    .ahtml-gallery-control-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
      padding-top: 0;
    }
    .ahtml-gallery-control-label {
      color: var(--muted-foreground);
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-description {
      color: color-mix(in srgb, var(--muted-foreground) 84%, transparent);
      font-size: 0.64rem;
      line-height: 1.2;
    }
    .ahtml-gallery-control-input-wrap,
    .ahtml-gallery-control-value {
      min-width: 0;
    }
    .ahtml-gallery-control-input {
      height: 1.8rem;
      padding-inline: 0.5rem;
      font-size: 0.74rem;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-font-field {
      display: grid;
      gap: 0.35rem;
    }
    .ahtml-gallery-font-field.is-focused {
      padding: 0.35rem 0.45rem;
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-font-picker-row {
      align-items: stretch;
    }
    .ahtml-gallery-font-picker-trigger {
      width: 100%;
      min-height: 1.9rem;
      justify-content: space-between;
      gap: 0.55rem;
      padding-inline: 0.6rem;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-font-picker-trigger-copy {
      display: grid;
      gap: 0.06rem;
      min-width: 0;
      text-align: left;
      flex: 1;
    }
    .ahtml-gallery-font-picker-trigger-copy strong {
      font-size: 0.78rem;
      line-height: 1.2;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ahtml-gallery-font-picker-trigger-copy span {
      color: var(--muted-foreground);
      font-size: 0.62rem;
      line-height: 1.2;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-font-picker-popover {
      width: min(19rem, calc(100vw - 2rem));
      gap: 0.6rem;
    }
    .ahtml-gallery-font-picker-search {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      padding: 0.15rem 0.2rem 0.15rem 0.6rem;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-font-picker-search-icon {
      flex: none;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-font-picker-search-input {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding-left: 0;
      padding-right: 0;
    }
    .ahtml-gallery-font-picker-search-input:focus-visible {
      box-shadow: none;
    }
    .ahtml-gallery-font-picker-list-scroll {
      max-height: 15rem;
    }
    .ahtml-gallery-font-picker-list {
      display: grid;
      gap: 0.35rem;
      padding-right: 0.2rem;
    }
    .ahtml-gallery-font-picker-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.55rem;
      width: 100%;
      min-width: 0;
      padding: 0.5rem 0.55rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.82);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-font-picker-option:hover,
    .ahtml-gallery-font-picker-option.is-active {
      border-color: color-mix(in srgb, var(--border) 76%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-font-picker-option.is-active {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-font-picker-option-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
      flex: 1;
    }
    .ahtml-gallery-font-picker-option-copy strong {
      font-size: 0.78rem;
      line-height: 1.2;
      font-weight: 600;
    }
    .ahtml-gallery-font-picker-option-copy span {
      color: var(--muted-foreground);
      font-size: 0.62rem;
      line-height: 1.2;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-font-picker-empty {
      padding: 0.55rem 0.25rem;
      color: var(--muted-foreground);
      font-size: 0.76rem;
      line-height: 1.4;
    }
    .ahtml-gallery-font-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      padding-left: calc(5.4rem + 0.55rem);
    }
    .ahtml-gallery-font-preset {
      border-radius: 999px;
      min-height: 1.7rem;
      padding-inline: 0.55rem;
      font-size: 0.72rem;
    }
    .ahtml-gallery-slider-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }
    .ahtml-gallery-slider-control {
      min-width: 0;
    }
    .ahtml-gallery-slider-input-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      flex: none;
    }
    .ahtml-gallery-slider-input-wrap .ahtml-gallery-control-input {
      width: 4.1rem;
      height: 1.7rem;
      padding-inline: 0.4rem;
      text-align: right;
    }
    .ahtml-gallery-shadow-grid {
      display: grid;
      gap: 0.4rem;
    }
    .ahtml-gallery-slider-unit {
      color: var(--muted-foreground);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-control-row-focused {
      padding: 0.35rem 0.45rem;
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-control-input-mono,
    .ahtml-gallery-control-value strong {
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }
    .ahtml-gallery-token-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 10rem);
      gap: 0.55rem;
      align-items: center;
      padding: 0.32rem 0.45rem;
      border: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-token-meta {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
    }
    .ahtml-gallery-color-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      border: 0;
      border-radius: calc(var(--radius) * 0.7);
      background: transparent;
      cursor: pointer;
    }
    .ahtml-gallery-token-copy {
      display: grid;
      gap: 0.04rem;
      min-width: 0;
    }
    .ahtml-gallery-token-copy strong {
      font-size: 0.74rem;
      line-height: 1.2;
    }
    .ahtml-gallery-token-copy span {
      color: var(--muted-foreground);
      font-size: 0.62rem;
      line-height: 1.2;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-token-input-wrap {
      min-width: 0;
    }
    .ahtml-gallery-token-input {
      height: 1.8rem;
      font-size: 0.72rem;
      letter-spacing: 0;
    }
    .ahtml-gallery-color-popover {
      width: min(18rem, calc(100vw - 2rem));
      gap: 0.6rem;
    }
    .ahtml-gallery-color-popover-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.35rem;
    }
    .ahtml-gallery-color-suggestion {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      width: 100%;
      min-width: 0;
      padding: 0.38rem 0.45rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.72);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      color: inherit;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.68rem;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease;
    }
    .ahtml-gallery-color-suggestion:hover {
      border-color: color-mix(in srgb, var(--border) 84%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-color-suggestion-swatch {
      width: 0.82rem;
      height: 0.82rem;
      flex: none;
      border-radius: 0.24rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-color-popover-input-wrap {
      padding-top: 0.1rem;
    }
    .ahtml-gallery-token-row:hover {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 18%, transparent);
    }
    .ahtml-gallery-token-row.is-focused {
      border-color: color-mix(in srgb, var(--ring) 56%, transparent);
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 14%, transparent);
    }
    .ahtml-gallery-swatch {
      width: 0.9rem;
      height: 0.9rem;
      border-radius: 0.28rem;
      border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
    }
    .ahtml-gallery-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ahtml-gallery-control-readout,
    .ahtml-gallery-field-row strong {
      display: block;
      padding: 0.5rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.85);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      font-weight: 600;
      font-size: 0.82rem;
      line-height: 1.35;
    }
    .ahtml-gallery-wrap {
      word-break: break-word;
    }
    .ahtml-gallery-error {
      margin: 0;
      color: var(--destructive);
      line-height: 1.4;
    }
    .ahtml-gallery-preview {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-preview-toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.55rem;
      min-width: 0;
    }
    .ahtml-gallery-toolbar-group {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      flex-wrap: wrap;
      padding: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-toolbar-group-label {
      padding-inline: 0.45rem 0.2rem;
      color: var(--muted-foreground);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ahtml-gallery-toolbar-group-body {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-action-separator {
      min-height: 1.6rem;
      margin-inline: 0.15rem;
      background: color-mix(in srgb, var(--border) 74%, transparent);
    }
    .ahtml-gallery-preview-pill-scroll {
      flex: 1;
      min-width: 0;
    }
    .ahtml-gallery-preview-tabs {
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview-shell {
      display: flex;
      min-height: 0;
      height: 100%;
      flex-direction: column;
    }
    .ahtml-gallery-preview-shell[data-fullscreen="true"] {
      background: var(--background);
    }
    .ahtml-gallery-preview-topbar {
      align-items: center;
      gap: 1rem;
      padding-top: 0.55rem;
      padding-bottom: 0.55rem;
    }
    .ahtml-gallery-preview-modebar {
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-top: 0.55rem;
      padding-bottom: 0.55rem;
    }
    .ahtml-gallery-preview-mode-tools {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
      flex-wrap: wrap;
    }
    .ahtml-gallery-more-previews,
    .ahtml-gallery-inspector-button {
      border-radius: 999px;
    }
    .ahtml-gallery-preview-toolbar [data-slot="button"] {
      border-radius: 999px;
    }
    .ahtml-gallery-toolbar-group [data-slot="button"] {
      border-radius: 999px;
    }
    .ahtml-gallery-segmented-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-toggle-button {
      min-width: 4.25rem;
      border-radius: 999px;
    }
    .ahtml-gallery-preset-theme-toggle {
      justify-content: space-between;
    }
    .ahtml-gallery-preview-stage {
      display: flex;
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview-context {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.45rem;
      min-width: 0;
      flex-wrap: wrap;
      color: var(--muted-foreground);
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-context span {
      color: var(--muted-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-preview-context strong {
      color: var(--foreground);
      font-size: 0.72rem;
      line-height: 1;
      letter-spacing: 0;
      text-transform: none;
    }
    .ahtml-gallery-preview-canvas {
      min-height: 0;
      flex: 1;
      overflow: auto;
      padding: 0;
    }
    .ahtml-gallery-preview-panel {
      margin: 0;
      min-height: 100%;
    }
    .ahtml-gallery-stage-frame {
      min-height: 100%;
      border: 0;
      border-radius: 0;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 95%, var(--muted) 5%)
        );
      box-sizing: border-box;
      padding: 0.9rem 0.9rem 1.1rem;
    }
    .ahtml-gallery-stage-frame-components,
    .ahtml-gallery-stage-frame-full,
    .ahtml-gallery-stage-frame-custom,
    .ahtml-gallery-stage-frame-dashboard {
      padding-top: 0.7rem;
    }
    .ahtml-gallery-stage-frame-mail {
      padding-top: 0.7rem;
    }
    .ahtml-gallery-stage-frame-forms,
    .ahtml-gallery-stage-frame-colors,
    .ahtml-gallery-stage-frame-disclosure,
    .ahtml-gallery-stage-frame-typography {
      display: grid;
      align-items: start;
      justify-items: center;
    }
    .ahtml-gallery-stage-frame-custom,
    .ahtml-gallery-stage-frame-components,
    .ahtml-gallery-stage-frame-dashboard,
    .ahtml-gallery-stage-frame-mail {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }
    .ahtml-gallery-preview-surface {
      position: relative;
      min-height: 100%;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.35);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 99%, var(--muted) 1%),
          color-mix(in srgb, var(--background) 95%, var(--muted) 5%)
        );
      box-shadow:
        var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread)
          color-mix(in srgb, var(--shadow-color) calc(var(--shadow-opacity) * 100%), transparent),
        0 10px 32px color-mix(in srgb, var(--foreground) 7%, transparent);
      color: var(--foreground);
      box-sizing: border-box;
    }
    .ahtml-gallery-stage-frame-custom .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-components .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-dashboard .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-mail .ahtml-gallery-preview-surface {
      border-radius: calc(var(--radius) * 1.1);
      box-shadow:
        var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread)
          color-mix(in srgb, var(--shadow-color) calc(var(--shadow-opacity) * 100%), transparent),
        0 6px 18px color-mix(in srgb, var(--foreground) 5%, transparent);
    }
    .ahtml-gallery-preview-surface[data-inspector="true"] {
      cursor: crosshair;
    }
    .ahtml-gallery-preview-surface-inner {
      min-height: 100%;
      padding: 1rem;
      box-sizing: border-box;
    }
    .ahtml-gallery-inspector-overlay {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      justify-content: flex-end;
      pointer-events: none;
      padding: 0.75rem 0.75rem 0;
    }
    .ahtml-gallery-inspector-outline {
      position: absolute;
      border: 1px solid color-mix(in srgb, var(--ring) 82%, white 18%);
      border-radius: calc(var(--radius) * 0.9);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--background) 92%, transparent),
        0 0 0 4px color-mix(in srgb, var(--ring) 18%, transparent);
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      transition:
        top 120ms ease,
        left 120ms ease,
        width 120ms ease,
        height 120ms ease;
    }
    .ahtml-gallery-inspector-outline-label {
      position: absolute;
      top: -0.65rem;
      left: 0.55rem;
      padding: 0.16rem 0.45rem;
      border-radius: 999px;
      background: var(--foreground);
      color: var(--background);
      font-size: 0.67rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ahtml-gallery-inspector-panel {
      display: grid;
      gap: 0.18rem;
      min-width: 13rem;
      max-width: min(100%, 24rem);
      pointer-events: auto;
      padding: 0.7rem 0.85rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--popover) 94%, transparent);
      color: var(--popover-foreground);
      box-shadow: 0 12px 40px color-mix(in srgb, var(--foreground) 12%, transparent);
      backdrop-filter: blur(12px);
    }
    .ahtml-gallery-inspector-kicker {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-inspector-panel strong {
      line-height: 1.2;
    }
    .ahtml-gallery-inspector-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.45rem;
      margin-top: 0.35rem;
    }
    .ahtml-gallery-inspector-panel span:last-child {
      color: color-mix(in srgb, var(--popover-foreground) 74%, var(--muted-foreground) 26%);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-inspector-token-group {
      display: grid;
      gap: 0.3rem;
      margin-top: 0.4rem;
    }
    .ahtml-gallery-inspector-token-label {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-inspector-token-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .ahtml-gallery-inspector-token {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.7rem;
      padding: 0.2rem 0.48rem;
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 42%, transparent);
      appearance: none;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.72rem;
      font-weight: 500;
      line-height: 1.2;
      color: var(--popover-foreground);
      word-break: break-word;
      text-align: left;
    }
    .ahtml-gallery-inspector-token.is-action {
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-inspector-token.is-action:hover {
      border-color: color-mix(in srgb, var(--ring) 54%, transparent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }
    .ahtml-gallery-inspector-token.is-focused {
      border-color: color-mix(in srgb, var(--ring) 68%, transparent);
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 16%, transparent);
    }
    .ahtml-gallery-inspector-hint {
      margin-top: 0.35rem;
    }
    .ahtml-gallery-stage-frame-components .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-mail .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-full .ahtml-gallery-preview-surface {
      width: 100%;
    }
    .ahtml-gallery-stage-frame-custom .ahtml-gallery-preview-surface,
    .ahtml-gallery-stage-frame-dashboard .ahtml-gallery-preview-surface {
      width: 100%;
    }
    .ahtml-gallery-stage-frame-forms .ahtml-gallery-preview-surface {
      width: min(100%, 58rem);
    }
    .ahtml-gallery-stage-frame-colors .ahtml-gallery-preview-surface {
      width: min(100%, 72rem);
    }
    .ahtml-gallery-stage-frame-disclosure .ahtml-gallery-preview-surface {
      width: min(100%, 62rem);
    }
    .ahtml-gallery-stage-frame-typography .ahtml-gallery-preview-surface {
      width: min(100%, 70rem);
    }
    .ahtml-gallery-preview-document {
      width: 100%;
      padding: 0;
      min-height: auto;
      align-content: start;
    }
    .ahtml-gallery-stage-panel {
      display: grid;
      gap: 1rem;
      width: min(100%, 72rem);
      padding: 0.25rem;
    }
    .ahtml-gallery-stage-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-stage-toolbar-inset {
      padding: 0.85rem 1rem;
      margin: -1rem -1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-stage-toolbar-copy {
      display: grid;
      gap: 0.12rem;
      min-width: 0;
    }
    .ahtml-gallery-stage-toolbar-copy strong {
      font-size: 0.92rem;
      line-height: 1.35;
      letter-spacing: -0.01em;
    }
    .ahtml-gallery-stage-toolbar-meta {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-wrap: wrap;
      min-width: 0;
    }
    .ahtml-gallery-stage-panel-header {
      display: grid;
      gap: 0.2rem;
      max-width: 44rem;
    }
    .ahtml-gallery-stage-panel-header h3 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .ahtml-gallery-stage-panel-header p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .ahtml-gallery-stage-panel-kicker {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-panel {
      max-width: 68rem;
    }
    .ahtml-gallery-color-panel {
      width: min(100%, 72rem);
    }
    .ahtml-gallery-custom-panel {
      width: min(100%, 72rem);
    }
    .ahtml-gallery-workbench-panel {
      width: min(100%, 76rem);
    }
    .ahtml-gallery-custom-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .ahtml-gallery-custom-browser {
      display: grid;
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.25);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
      box-shadow: 0 12px 30px color-mix(in srgb, var(--foreground) 7%, transparent);
    }
    .ahtml-gallery-custom-preview-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.6rem 0.85rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 54%, transparent);
      flex-wrap: wrap;
    }
    .ahtml-gallery-custom-preview-input {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      min-width: min(100%, 24rem);
      flex: 1;
      padding-left: 0.2rem;
    }
    .ahtml-gallery-custom-preview-input [data-slot="input"] {
      padding-left: 2rem;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
      font-size: 0.76rem;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-custom-preview-input-icon {
      position: absolute;
      left: 0.8rem;
      top: 50%;
      width: 0.9rem;
      height: 0.9rem;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
      z-index: 1;
    }
    .ahtml-gallery-custom-preview-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-custom-browser-bar {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.85rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
    }
    .ahtml-gallery-custom-browser-dots {
      display: inline-flex;
      gap: 0.35rem;
    }
    .ahtml-gallery-custom-browser-dots span {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--muted-foreground) 26%, transparent);
    }
    .ahtml-gallery-custom-browser-url {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--muted-foreground);
      font-size: 0.76rem;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }
    .ahtml-gallery-custom-page {
      display: grid;
      gap: 1rem;
      padding: 0;
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 12%, transparent), transparent 32%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 99%, var(--muted) 1%), color-mix(in srgb, var(--background) 95%, var(--muted) 5%));
    }
    .ahtml-gallery-custom-preview-empty {
      display: grid;
      justify-items: center;
      gap: 1rem;
      margin: 0 1rem;
      padding: 1.4rem 1rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.15);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
      text-align: center;
    }
    .ahtml-gallery-custom-preview-empty h4 {
      margin: 0;
      font-size: 1.15rem;
      line-height: 1.2;
    }
    .ahtml-gallery-custom-preview-empty-icons {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
    }
    .ahtml-gallery-custom-preview-empty-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 52%, transparent);
    }
    .ahtml-gallery-custom-preview-empty-separator {
      color: var(--muted-foreground);
      width: 1rem;
      height: 1rem;
    }
    .ahtml-gallery-custom-preview-steps {
      display: grid;
      gap: 0.55rem;
      max-width: 36rem;
      color: var(--muted-foreground);
      font-size: 0.86rem;
      line-height: 1.55;
      text-align: left;
    }
    .ahtml-gallery-custom-preview-steps div {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 0.5rem;
    }
    .ahtml-gallery-custom-preview-guides {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-custom-preview-guides button {
      min-height: 1.8rem;
      padding: 0.35rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
      color: var(--foreground);
      font-size: 0.72rem;
      font-weight: 600;
    }
    .ahtml-gallery-custom-connection-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      width: fit-content;
      margin: 0 1rem;
      padding: 0.3rem 0.4rem 0.3rem 0.35rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--popover) 94%, transparent);
      color: var(--foreground);
      box-shadow: 0 8px 24px color-mix(in srgb, var(--foreground) 8%, transparent);
      backdrop-filter: blur(12px);
    }
    .ahtml-gallery-custom-connection-label {
      color: var(--muted-foreground);
      font-size: 0.72rem;
      line-height: 1.3;
    }
    .ahtml-gallery-custom-connection-indicator {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--chart-2) 82%, white 18%);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--chart-2) 14%, transparent);
      animation: ahtml-gallery-connection-pulse 2.2s ease-in-out infinite;
    }
    @keyframes ahtml-gallery-connection-pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.15);
        opacity: 0.82;
      }
    }
    .ahtml-gallery-custom-site-header {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 1rem;
      margin: 0 1rem;
      padding: 0.9rem 1rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-custom-site-brand {
      display: grid;
      gap: 0.25rem;
    }
    .ahtml-gallery-custom-site-brand strong {
      line-height: 1.15;
    }
    .ahtml-gallery-custom-site-nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.85rem;
      min-width: 0;
      flex-wrap: wrap;
      color: var(--muted-foreground);
      font-size: 0.78rem;
    }
    .ahtml-gallery-custom-site-nav span.is-active {
      color: var(--foreground);
      font-weight: 700;
    }
    .ahtml-gallery-custom-site-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ahtml-gallery-custom-stage-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 0.7fr);
      gap: 1rem;
      padding: 0 1rem;
    }
    .ahtml-gallery-custom-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
      padding: 1rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 94%, var(--muted) 6%);
    }
    .ahtml-gallery-custom-hero-copy {
      display: grid;
      gap: 0.75rem;
      align-content: start;
    }
    .ahtml-gallery-custom-hero-copy h3 {
      margin: 0;
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      line-height: 1.05;
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-custom-hero-copy p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: 0.92rem;
      line-height: 1.65;
      max-width: 34rem;
    }
    .ahtml-gallery-custom-hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ahtml-gallery-custom-stat-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 0.35rem;
    }
    .ahtml-gallery-custom-stat {
      display: grid;
      gap: 0.15rem;
      padding: 0.7rem 0.75rem;
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-custom-stat span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-custom-hero-panel {
      display: grid;
      gap: 0.75rem;
      align-content: start;
    }
    .ahtml-gallery-custom-swatch-stack {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.45rem;
    }
    .ahtml-gallery-custom-swatch-stack span {
      min-height: 3.2rem;
      border-radius: calc(var(--radius) * 0.95);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-custom-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
      gap: 0.85rem;
      padding: 0 1rem 1rem;
    }
    .ahtml-gallery-custom-grid-rich {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .ahtml-gallery-custom-card {
      box-shadow: none;
    }
    .ahtml-gallery-custom-side-card {
      height: 100%;
      align-self: stretch;
    }
    .ahtml-gallery-custom-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .ahtml-gallery-workbench-card {
      box-shadow: none;
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-custom-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ahtml-gallery-custom-copy {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.55;
    }
    .ahtml-gallery-custom-note-list,
    .ahtml-gallery-custom-signal-list {
      display: grid;
      gap: 0.55rem;
    }
    .ahtml-gallery-custom-note-list span {
      color: var(--muted-foreground);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-custom-progress-list {
      display: grid;
      gap: 0.7rem;
    }
    .ahtml-gallery-custom-progress-row {
      display: grid;
      gap: 0.35rem;
    }
    .ahtml-gallery-custom-signal-item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
      gap: 0.5rem;
    }
    .ahtml-gallery-custom-signal-dot {
      width: 0.55rem;
      height: 0.55rem;
      margin-top: 0.35rem;
      border-radius: 999px;
      background: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
    }
    .ahtml-gallery-stage-action-card {
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-stage-action-card:hover {
      border-color: color-mix(in srgb, var(--border) 82%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-color-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .ahtml-gallery-inline-metrics {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .ahtml-gallery-inline-metrics strong,
    .ahtml-gallery-goal-number {
      font-size: 1.6rem;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-cards-workbench {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    .ahtml-gallery-cards-column {
      display: grid;
      gap: 1rem;
      align-content: start;
    }
    .ahtml-gallery-cards-split {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .ahtml-gallery-cards-split-tight {
      gap: 0.75rem;
    }
    .ahtml-gallery-mini-calendar {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.35rem;
      text-align: center;
      font-size: 0.72rem;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-mini-calendar span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.85rem;
      border-radius: calc(var(--radius) * 0.7);
      background: color-mix(in srgb, var(--background) 95%, var(--muted) 5%);
    }
    .ahtml-gallery-mini-calendar span.is-active {
      background: var(--primary);
      color: var(--primary-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-toggle-list {
      display: grid;
      gap: 0.75rem;
    }
    .ahtml-gallery-toggle-list label,
    .ahtml-gallery-feature-list label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.82rem;
    }
    .ahtml-gallery-chat-thread {
      display: grid;
      gap: 0.75rem;
    }
    .ahtml-gallery-chat-thread > div {
      display: grid;
      gap: 0.22rem;
      padding: 0.75rem;
      border-radius: calc(var(--radius) * 0.95);
      background: color-mix(in srgb, var(--muted) 48%, transparent);
    }
    .ahtml-gallery-chat-thread > div.is-reply {
      background: color-mix(in srgb, var(--secondary) 72%, transparent);
    }
    .ahtml-gallery-chat-thread p {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-member-list {
      display: grid;
      gap: 0.65rem;
    }
    .ahtml-gallery-member-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.65rem;
    }
    .ahtml-gallery-member-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--secondary) 76%, transparent);
      color: var(--secondary-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-member-copy {
      display: grid;
      gap: 0.08rem;
      min-width: 0;
    }
    .ahtml-gallery-member-copy span {
      color: var(--muted-foreground);
      font-size: 0.76rem;
    }
    .ahtml-gallery-workbench-footer {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-color-hero {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-color-mode-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
      gap: 0.9rem;
    }
    .ahtml-gallery-color-mode-panel {
      display: grid;
      gap: 0.85rem;
      padding: 0.9rem;
      border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-color-mode-panel.is-active {
      border-color: color-mix(in srgb, var(--ring) 58%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 12%, transparent);
    }
    .ahtml-gallery-color-mode-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-color-mode-copy {
      display: grid;
      gap: 0.08rem;
    }
    .ahtml-gallery-color-mode-copy span {
      color: var(--muted-foreground);
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .ahtml-gallery-color-mode-copy strong {
      font-size: 0.86rem;
      line-height: 1.3;
    }
    .ahtml-gallery-color-card {
      display: grid;
      gap: 0.7rem;
      width: 100%;
      padding: 0.9rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.05);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease;
    }
    .ahtml-gallery-color-card:hover {
      border-color: color-mix(in srgb, var(--border) 82%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 10%, transparent);
    }
    .ahtml-gallery-color-card-swatch {
      display: block;
      width: 100%;
      min-height: 4.25rem;
      border-radius: calc(var(--radius) * 0.9);
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-color-card-copy {
      display: grid;
      gap: 0.2rem;
    }
    .ahtml-gallery-color-card-copy span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-color-card-copy strong {
      font-family: monospace;
      font-size: 0.88rem;
      line-height: 1.45;
      word-break: break-word;
    }
    .ahtml-gallery-color-card-action {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .ahtml-gallery-typography-sample-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-typography-sample {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }
    .ahtml-gallery-typography-sample h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3rem);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-typography-body-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }
    .ahtml-gallery-typography-body-copy {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.65;
      color: var(--foreground);
    }
    .ahtml-gallery-typography-note-stack {
      display: grid;
      gap: 0.7rem;
    }
    .ahtml-gallery-typography-note-stack p {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.55;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-chip {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 0.35rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ahtml-gallery-typography-kicker {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-typography-token {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--muted) 56%, transparent);
      font-family: monospace;
      font-size: 0.86rem;
    }
    .ahtml-gallery-dashboard-shell {
      display: grid;
      grid-template-columns: 14rem minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
    }
    .ahtml-gallery-dashboard-sidebar {
      display: grid;
      align-content: start;
      gap: 0.75rem;
      padding: 1rem;
      border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--muted) 42%, transparent);
    }
    .ahtml-gallery-dashboard-nav-group {
      display: grid;
      gap: 0.55rem;
    }
    .ahtml-gallery-dashboard-sidebar span {
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-dashboard-nav-group span.is-active {
      color: var(--sidebar-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-dashboard-main {
      display: grid;
      gap: 1rem;
      padding: 0 1rem 1rem;
    }
    .ahtml-gallery-dashboard-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-dashboard-header h4,
    .ahtml-gallery-mail-display-header h4,
    .ahtml-gallery-pricing-header h4 {
      margin: 0.12rem 0 0;
      font-size: 1.3rem;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-dashboard-section-cards {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-chart-bars {
      display: grid;
      grid-template-columns: repeat(8, minmax(0, 1fr));
      align-items: end;
      gap: 0.5rem;
      min-height: 14rem;
    }
    .ahtml-gallery-chart-bars span {
      border-radius: calc(var(--radius) * 0.75) calc(var(--radius) * 0.75) 0 0;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, white 15%, transparent);
    }
    .ahtml-gallery-dashboard-lower {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 0.8fr);
      gap: 0.75rem;
    }
    .ahtml-gallery-dashboard-secondary-stack {
      display: grid;
      gap: 0.75rem;
    }
    .ahtml-gallery-dashboard-chart-footer {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 0.9rem;
    }
    .ahtml-gallery-dashboard-mix-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 1rem;
    }
    .ahtml-gallery-dashboard-donut {
      width: 7rem;
      height: 7rem;
      border-radius: 999px;
      position: relative;
    }
    .ahtml-gallery-dashboard-donut::after {
      content: "";
      position: absolute;
      inset: 1.25rem;
      border-radius: 999px;
      background: var(--card);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-dashboard-mix-list {
      display: grid;
      gap: 0.45rem;
      min-width: 0;
    }
    .ahtml-gallery-mail-shell {
      display: grid;
      grid-template-columns: 13rem minmax(15rem, 18rem) minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 99%, var(--muted) 1%);
    }
    .ahtml-gallery-mail-nav,
    .ahtml-gallery-mail-list,
    .ahtml-gallery-mail-display {
      display: grid;
      align-content: start;
      gap: 0.85rem;
      padding: 1rem;
      min-width: 0;
    }
    .ahtml-gallery-mail-nav,
    .ahtml-gallery-mail-list {
      border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-mail-nav-links {
      display: grid;
      gap: 0.6rem;
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-mail-nav-links span.is-active {
      color: var(--sidebar-foreground);
      font-weight: 700;
    }
    .ahtml-gallery-mail-list-toolbar {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-list-header {
      display: grid;
      gap: 0.75rem;
    }
    .ahtml-gallery-mail-list-header h5 {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.1;
    }
    .ahtml-gallery-mail-tab-pills {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-search-wrap {
      position: relative;
    }
    .ahtml-gallery-mail-search-wrap .ahtml-gallery-control-input,
    .ahtml-gallery-mail-search-wrap [data-slot="input"] {
      padding-left: 2rem;
    }
    .ahtml-gallery-mail-search-icon {
      position: absolute;
      top: 50%;
      left: 0.7rem;
      width: 0.9rem;
      height: 0.9rem;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .ahtml-gallery-mail-list-item {
      display: grid;
      gap: 0.35rem;
      padding: 0.8rem;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) * 0.9);
      background: transparent;
      text-align: left;
      color: inherit;
      cursor: pointer;
    }
    .ahtml-gallery-mail-list-item.is-active {
      border-color: color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .ahtml-gallery-mail-list-item span {
      color: var(--muted-foreground);
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .ahtml-gallery-mail-list-item p {
      margin: 0;
      color: color-mix(in srgb, var(--muted-foreground) 88%, transparent);
      font-size: 0.76rem;
      line-height: 1.45;
    }
    .ahtml-gallery-mail-display-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-display-header p {
      margin: 0.25rem 0 0;
      color: var(--muted-foreground);
      font-size: 0.82rem;
    }
    .ahtml-gallery-mail-display-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .ahtml-gallery-mail-display-body {
      display: grid;
      gap: 0.75rem;
    }
    .ahtml-gallery-mail-display-body p {
      margin: 0;
      color: var(--foreground);
      font-size: 0.92rem;
      line-height: 1.7;
    }
    .ahtml-gallery-mail-quote {
      display: grid;
      gap: 0.35rem;
      padding: 0.9rem;
      border-left: 2px solid color-mix(in srgb, var(--border) 76%, transparent);
      background: color-mix(in srgb, var(--muted) 38%, transparent);
      border-radius: 0 calc(var(--radius) * 0.9) calc(var(--radius) * 0.9) 0;
    }
    .ahtml-gallery-mail-quote strong {
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-mail-attachments {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-mail-attachment-card {
      display: grid;
      gap: 0.18rem;
      padding: 0.8rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 0.9);
      background: color-mix(in srgb, var(--background) 97%, var(--muted) 3%);
    }
    .ahtml-gallery-mail-attachment-card span {
      color: var(--muted-foreground);
      font-size: 0.76rem;
    }
    .ahtml-gallery-pricing-shell {
      display: grid;
      gap: 1rem;
    }
    .ahtml-gallery-pricing-header {
      display: grid;
      justify-items: center;
      text-align: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 98%, var(--muted) 2%);
    }
    .ahtml-gallery-pricing-header p {
      margin: 0;
      color: var(--muted-foreground);
      max-width: 34rem;
      line-height: 1.6;
    }
    .ahtml-gallery-pricing-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
    }
    .ahtml-gallery-pricing-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .ahtml-gallery-pricing-grid > *:nth-child(2) {
      transform: translateY(1.2rem);
    }
    .ahtml-gallery-feature-list {
      display: grid;
      gap: 0.7rem;
    }
    @media (max-width: 1100px) {
      .ahtml-gallery-preset-popover-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ahtml-gallery-shell {
        grid-template-rows: auto auto auto minmax(0, 1fr);
      }
      .ahtml-gallery-sidebar {
        width: 100%;
        min-width: 0;
        border-right: 0;
      }
      .ahtml-gallery-mobile-tabs {
        display: block;
      }
      .ahtml-gallery-main {
        flex-direction: column;
      }
      .ahtml-gallery-divider {
        display: none;
      }
      .ahtml-gallery-sidebar,
      .ahtml-gallery-preview {
        min-height: 0;
      }
      .ahtml-gallery-sidebar[data-mobile-panel="hidden"],
      .ahtml-gallery-preview[data-mobile-panel="hidden"] {
        display: none;
      }
      .ahtml-gallery-page-header {
        align-items: start;
        flex-direction: column;
      }
      .ahtml-gallery-preset-rail {
        flex-direction: column;
      }
      .ahtml-gallery-preset-meta {
        min-width: 0;
      }
      .ahtml-gallery-preset-footnote {
        flex-wrap: wrap;
      }
      .ahtml-gallery-pill-scroll {
        width: 100%;
      }
      .ahtml-gallery-preview-topbar,
      .ahtml-gallery-preview-modebar {
        flex-direction: column;
        align-items: stretch;
      }
      .ahtml-gallery-control-header-row,
      .ahtml-gallery-control-header-row-tabs {
        align-items: stretch;
      }
      .ahtml-gallery-preview-mode-tools {
        width: 100%;
      }
      .ahtml-gallery-preview-toolbar {
        justify-content: start;
      }
      .ahtml-gallery-toolbar-group {
        width: 100%;
        justify-content: space-between;
      }
      .ahtml-gallery-toolbar-group-body {
        justify-content: flex-end;
      }
      .ahtml-gallery-preview-context {
        justify-content: start;
      }
      .ahtml-gallery-stage-toolbar,
      .ahtml-gallery-stage-toolbar-inset {
        align-items: flex-start;
      }
      .ahtml-gallery-preset-option {
        align-items: start;
      }
      .ahtml-gallery-preset-option-status {
        justify-content: flex-start;
      }
      .ahtml-gallery-control-row,
      .ahtml-gallery-field-row {
        grid-template-columns: 1fr;
        gap: 0.35rem;
      }
      .ahtml-gallery-token-row {
        grid-template-columns: 1fr;
        gap: 0.45rem;
      }
      .ahtml-gallery-custom-hero,
      .ahtml-gallery-custom-stage-grid,
      .ahtml-gallery-custom-grid-rich,
      .ahtml-gallery-custom-site-header,
      .ahtml-gallery-cards-workbench,
      .ahtml-gallery-cards-split,
      .ahtml-gallery-dashboard-shell,
      .ahtml-gallery-dashboard-section-cards,
      .ahtml-gallery-dashboard-lower,
      .ahtml-gallery-mail-shell,
      .ahtml-gallery-pricing-grid {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-dashboard-sidebar,
      .ahtml-gallery-mail-nav,
      .ahtml-gallery-mail-list {
        border-right: 0;
        border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      }
      .ahtml-gallery-custom-browser-bar {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-custom-preview-toolbar {
        align-items: stretch;
      }
      .ahtml-gallery-custom-stat-strip,
      .ahtml-gallery-dashboard-chart-footer,
      .ahtml-gallery-mail-attachments,
      .ahtml-gallery-dashboard-mix-card,
      .ahtml-gallery-mail-list-header {
        grid-template-columns: 1fr;
      }
      .ahtml-gallery-pricing-grid > *:nth-child(2) {
        transform: none;
      }
      .ahtml-gallery-control-copy {
        padding-top: 0;
      }
      .ahtml-gallery-font-presets {
        padding-left: 0;
      }
      .ahtml-gallery-slider-field {
        grid-template-columns: 1fr;
        gap: 0.45rem;
      }
      .ahtml-gallery-stage-frame {
        padding: 0.75rem 0.75rem 0.9rem;
      }
      .ahtml-gallery-preview-surface-inner {
        padding: 0.75rem;
      }
    }
  `
}

