import type {
  PetSettingsAction,
  PetSettingsSurfaceSnapshot,
} from "@/app/pet/host/pet-settings-content"
import { createSecondaryWindowSurface } from "@/app/shared/window/secondary-window"

export const PET_SETTINGS_WINDOW_LABEL = "pet-settings"
export const PET_SETTINGS_SNAPSHOT_EVENT = "pet-settings://snapshot"
export const PET_SETTINGS_ACTION_EVENT = "pet-settings://action"
export const PET_SETTINGS_SNAPSHOT_STORAGE_KEY =
  "agent-html:pet-settings-native-snapshot"

export type PetSettingsNativeSnapshot = PetSettingsSurfaceSnapshot

export type PetSettingsNativeAction = PetSettingsAction

const petSettingsSecondaryWindow = createSecondaryWindowSurface<
  PetSettingsNativeSnapshot,
  PetSettingsNativeAction
>({
  actionEvent: PET_SETTINGS_ACTION_EVENT,
  defaultSize: {
    height: 640,
    width: 880,
  },
  label: PET_SETTINGS_WINDOW_LABEL,
  preload: () => import("@/app/pet/host/pet-settings-window-app"),
  snapshotEvent: PET_SETTINGS_SNAPSHOT_EVENT,
  snapshotStorageKey: PET_SETTINGS_SNAPSHOT_STORAGE_KEY,
  title: "Pet Settings",
  url: "/?window=pet-settings",
})

export function canUsePetSettingsNativeWindow() {
  return petSettingsSecondaryWindow.canUseNativeWindow()
}

export function readPetSettingsNativeSnapshotCache() {
  return petSettingsSecondaryWindow.readSnapshotCache()
}

export function preloadPetSettingsNativeWindowApp() {
  petSettingsSecondaryWindow.preloadWindowApp()
}

export async function openPetSettingsNativeWindow() {
  return petSettingsSecondaryWindow.openWindow()
}

export async function closePetSettingsNativeWindow() {
  await petSettingsSecondaryWindow.hideWindow()
}

export async function publishPetSettingsNativeSnapshot(
  snapshot: PetSettingsNativeSnapshot
) {
  await petSettingsSecondaryWindow.publishSnapshot(snapshot)
}

export async function dispatchPetSettingsNativeAction(
  action: PetSettingsNativeAction
) {
  await petSettingsSecondaryWindow.dispatchAction(action)
}

export async function subscribePetSettingsNativeActions(
  handler: (action: PetSettingsNativeAction) => void
) {
  return petSettingsSecondaryWindow.subscribeActions(handler)
}

export async function subscribePetSettingsNativeSnapshots(
  handler: (snapshot: PetSettingsNativeSnapshot) => void
) {
  return petSettingsSecondaryWindow.subscribeSnapshots(handler)
}
