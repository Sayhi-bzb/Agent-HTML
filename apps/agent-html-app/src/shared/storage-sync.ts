const syncedStorageEventType = "agent-html:storage-sync"

type SyncedStorageEventDetail = {
  key: string
}

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function dispatchSyncedStorageEvent(key: string) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent<SyncedStorageEventDetail>(syncedStorageEventType, {
      detail: { key },
    })
  )
}

export function readSyncedStorageValue<T>({
  defaultValue,
  parse,
  storageKey,
}: {
  defaultValue: T
  parse: (value: string | null) => T | null
  storageKey: string
}) {
  if (!hasBrowserStorage()) {
    return defaultValue
  }

  return parse(localStorage.getItem(storageKey)) ?? defaultValue
}

export function writeSyncedStorageValue({
  storageKey,
  value,
}: {
  storageKey: string
  value: string
}) {
  if (!hasBrowserStorage()) {
    return
  }

  localStorage.setItem(storageKey, value)
  dispatchSyncedStorageEvent(storageKey)
}

export function subscribeSyncedStorageKey(
  storageKey: string,
  listener: () => void
) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleSyncedStorageChange = (event: Event) => {
    const detail = (event as CustomEvent<SyncedStorageEventDetail>).detail
    if (detail?.key === storageKey) {
      listener()
    }
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.storageArea !== localStorage) {
      return
    }

    if (event.key === storageKey) {
      listener()
    }
  }

  window.addEventListener(syncedStorageEventType, handleSyncedStorageChange)
  window.addEventListener("storage", handleStorageChange)

  return () => {
    window.removeEventListener(
      syncedStorageEventType,
      handleSyncedStorageChange
    )
    window.removeEventListener("storage", handleStorageChange)
  }
}
