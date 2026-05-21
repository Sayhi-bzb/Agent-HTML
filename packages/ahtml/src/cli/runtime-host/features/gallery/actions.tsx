import React from "react"

import {
  createGalleryArtifactProfile,
  deleteGalleryArtifactProfile,
  saveGalleryArtifactProfile,
  selectGalleryArtifactProfile,
} from "./api"
import { getColorSectionIdForToken } from "./helpers"
import { galleryUnsavedStatus } from "./state"
import type {
  ArtifactProfile,
  FocusedEditorField,
  GalleryControlTab,
  GalleryEditorState,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "./types"

export function useGalleryDraftActions({
  colorThemeSyncEnabled,
  previewThemeMode,
  setColorSectionValues,
  setControlTab,
  setEditorState,
  setFocusedEditorField,
  setFocusedToken,
  setHasCopiedProfile,
  setMobileTab,
  setPreviewThemeMode,
}: {
  colorThemeSyncEnabled: boolean
  previewThemeMode: GalleryPreviewThemeMode
  setColorSectionValues: React.Dispatch<React.SetStateAction<string[]>>
  setControlTab: React.Dispatch<React.SetStateAction<GalleryControlTab>>
  setEditorState: React.Dispatch<React.SetStateAction<GalleryEditorState>>
  setFocusedEditorField: React.Dispatch<
    React.SetStateAction<FocusedEditorField | null>
  >
  setFocusedToken: React.Dispatch<
    React.SetStateAction<{
      mode: GalleryPreviewThemeMode
      tokenName: ThemeTokenName
    } | null>
  >
  setHasCopiedProfile: React.Dispatch<React.SetStateAction<boolean>>
  setMobileTab: React.Dispatch<React.SetStateAction<"controls" | "preview">>
  setPreviewThemeMode: React.Dispatch<
    React.SetStateAction<GalleryPreviewThemeMode>
  >
}) {
  const updateDraftProfile = React.useCallback(
    (updater: (draft: ArtifactProfile) => ArtifactProfile) => {
      setEditorState((current) => ({
        ...current,
        draftProfile: updater(current.draftProfile),
        error: "",
        isDirty: true,
        status: galleryUnsavedStatus,
      }))
    },
    [setEditorState],
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
          const otherMode = previewThemeMode === "light" ? "dark" : "light"
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

  const openControlTab = React.useCallback(
    (nextTab: GalleryControlTab) => {
      setControlTab(nextTab)
      setMobileTab("controls")

      if (nextTab !== "colors") {
        setFocusedToken(null)
      }

      if (nextTab !== "typography" && nextTab !== "other") {
        setFocusedEditorField(null)
      }
    },
    [
      setControlTab,
      setFocusedEditorField,
      setFocusedToken,
      setMobileTab,
    ],
  )

  const focusEditorField = React.useCallback(
    (field: FocusedEditorField) => {
      openControlTab(
        field === "radiusBase" || field === "spacing" || field === "shadow"
          ? "other"
          : "typography",
      )
      setFocusedEditorField(field)
    },
    [openControlTab, setFocusedEditorField],
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
    [
      openControlTab,
      previewThemeMode,
      setColorSectionValues,
      setFocusedToken,
      setPreviewThemeMode,
    ],
  )

  const resetDraft = React.useCallback(() => {
    setEditorState((current) => ({
      ...current,
      draftProfile: current.persistedProfile,
      error: "",
      isDirty: false,
      status: `Reset ${current.artifactProfileReference}.`,
    }))
  }, [setEditorState])

  const copyCurrentArtifactProfile = React.useCallback(
    async (draftProfile: ArtifactProfile) => {
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
        await navigator.clipboard.writeText(JSON.stringify(draftProfile, null, 2))
        setHasCopiedProfile(true)
        setEditorState((current) => ({
          ...current,
          status: `Copied ${current.artifactProfileReference} JSON.`,
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
    },
    [setEditorState, setHasCopiedProfile],
  )

  return {
    copyCurrentArtifactProfile,
    copyThemeTokens,
    focusEditorField,
    focusThemeToken,
    openControlTab,
    resetDraft,
    updateDraftProfile,
    updateThemeTokenValue,
  }
}

export function useGalleryProfileActions({
  editorState,
  setEditorState,
}: {
  editorState: GalleryEditorState
  setEditorState: React.Dispatch<React.SetStateAction<GalleryEditorState>>
}) {
  const saveProfile = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: "Saving artifact profile...",
    }))

    try {
      const result = await saveGalleryArtifactProfile(editorState.draftProfile)

      setEditorState((current) => ({
        ...current,
        availableArtifactProfileReferences:
          result.availableArtifactProfileReferences ??
          current.availableArtifactProfileReferences,
        builtinArtifactProfileReferences:
          result.builtinArtifactProfileReferences ??
          current.builtinArtifactProfileReferences,
        draftProfile: result.artifactProfile,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile,
        status: `Saved ${result.artifactProfileReference}.`,
        artifactProfileReference: result.artifactProfileReference,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Save failed.",
      }))
    }
  }, [editorState.draftProfile, setEditorState])

  const selectArtifactProfileReference = React.useCallback(
    async (nextArtifactProfileReference: string) => {
      setEditorState((current) => ({
        ...current,
        error: "",
        status: `Loading ${nextArtifactProfileReference}...`,
      }))

      try {
        const result = await selectGalleryArtifactProfile(
          nextArtifactProfileReference,
        )

        setEditorState((current) => ({
          ...current,
          availableArtifactProfileReferences:
            result.availableArtifactProfileReferences ??
            current.availableArtifactProfileReferences,
          builtinArtifactProfileReferences:
            result.builtinArtifactProfileReferences ??
            current.builtinArtifactProfileReferences,
          draftProfile: result.artifactProfile,
          error: "",
          isDirty: false,
          persistedProfile: result.artifactProfile,
          status: `Selected ${result.artifactProfileReference}.`,
          artifactProfileReference: result.artifactProfileReference,
        }))
      } catch (error) {
        setEditorState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : String(error),
          status: "Switch failed.",
        }))
      }
    },
    [setEditorState],
  )

  const cycleArtifactProfileReference = React.useCallback(
    (direction: "prev" | "next") => {
      const profileIds = editorState.availableArtifactProfileReferences
      const currentIndex = profileIds.indexOf(
        editorState.artifactProfileReference,
      )

      if (currentIndex === -1 || profileIds.length < 2) {
        return
      }

      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % profileIds.length
          : (currentIndex - 1 + profileIds.length) % profileIds.length

      void selectArtifactProfileReference(profileIds[nextIndex])
    },
    [
      editorState.availableArtifactProfileReferences,
      editorState.artifactProfileReference,
      selectArtifactProfileReference,
    ],
  )

  const randomizeArtifactProfileReference = React.useCallback(() => {
    const profileIds = editorState.availableArtifactProfileReferences

    if (profileIds.length < 2) {
      return
    }

    const nextCandidates = profileIds.filter(
      (profileId) => profileId !== editorState.artifactProfileReference,
    )
    const nextArtifactProfileReference =
      nextCandidates[Math.floor(Math.random() * nextCandidates.length)]

    if (nextArtifactProfileReference) {
      void selectArtifactProfileReference(nextArtifactProfileReference)
    }
  }, [
    editorState.availableArtifactProfileReferences,
    editorState.artifactProfileReference,
    selectArtifactProfileReference,
  ])

  const createArtifactProfileReference = React.useCallback(async () => {
    const createId = editorState.createId.trim()

    if (!createId) {
      setEditorState((current) => ({
        ...current,
        error: 'New profile id is required, for example "team-ops".',
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
      const result = await createGalleryArtifactProfile(createId)

      setEditorState((current) => ({
        ...current,
        availableArtifactProfileReferences:
          result.availableArtifactProfileReferences ??
          current.availableArtifactProfileReferences,
        builtinArtifactProfileReferences:
          result.builtinArtifactProfileReferences ??
          current.builtinArtifactProfileReferences,
        createId: "",
        draftProfile: result.artifactProfile,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile,
        status: `Created ${result.artifactProfileReference}.`,
        artifactProfileReference: result.artifactProfileReference,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Create failed.",
      }))
    }
  }, [editorState.createId, setEditorState])

  const deleteCurrentArtifactProfileReference = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Deleting ${current.artifactProfileReference}...`,
    }))

    try {
      const result = await deleteGalleryArtifactProfile(
        editorState.artifactProfileReference,
      )

      setEditorState((current) => ({
        ...current,
        availableArtifactProfileReferences:
          result.availableArtifactProfileReferences ??
          current.availableArtifactProfileReferences,
        builtinArtifactProfileReferences:
          result.builtinArtifactProfileReferences ??
          current.builtinArtifactProfileReferences,
        draftProfile: result.artifactProfile,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile,
        status: `Deleted profile. Current is ${result.artifactProfileReference}.`,
        artifactProfileReference: result.artifactProfileReference,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Delete failed.",
      }))
    }
  }, [editorState.artifactProfileReference, setEditorState])

  return {
    createArtifactProfileReference,
    cycleArtifactProfileReference,
    deleteCurrentArtifactProfileReference,
    randomizeArtifactProfileReference,
    saveProfile,
    selectArtifactProfileReference,
  }
}
