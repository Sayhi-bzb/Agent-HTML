import * as React from "react"

import { artifactBundleUrl, isArtifactBundleUrl } from "../api/api"
import type { ArtifactModule } from "../host-contracts"

export type ArtifactRuntimeStatus =
  | "idle"
  | "loading"
  | "mounted"
  | "failed"
  | "disposing"

export type ArtifactRuntimeErrorStage =
  | "bundle-load"
  | "dispose"
  | "mount"

export type ArtifactRuntimeErrorKind =
  | "http-error"
  | "module-graph-error"
  | "optimized-dependency-outdated"
  | "server-unavailable"
  | "transform-error"
  | "unknown"

export type ArtifactRuntimeError = {
  details?: string
  filePath: string
  kind: ArtifactRuntimeErrorKind
  message: string
  recoverable: boolean
  stack?: string
  stage: ArtifactRuntimeErrorStage
  statusCode?: number
}

export type ArtifactRuntimeSnapshot = {
  error: ArtifactRuntimeError | null
  mountedFilePath: string | null
  status: ArtifactRuntimeStatus
}

type ArtifactRuntimeListener = (snapshot: ArtifactRuntimeSnapshot) => void

const maxAutomaticRecoveries = 3
const optimizedDependencyOutdatedStatus = 504

type ArtifactRuntimeOptions = {
  fetchBundle?: (url: string) => Promise<Response>
  importModule?: (url: string) => Promise<ArtifactModule>
  onMounted?: () => void
}

const emptySnapshot: ArtifactRuntimeSnapshot = {
  error: null,
  mountedFilePath: null,
  status: "idle",
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function errorStack(error: unknown) {
  return error instanceof Error && error.stack ? error.stack : undefined
}

function recentOptimizedDependencyFailure() {
  if (
    typeof performance === "undefined" ||
    typeof performance.getEntriesByType !== "function"
  ) {
    return null
  }

  const entries = performance.getEntriesByType("resource")
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index]
    if (
      "responseStatus" in entry &&
      entry.responseStatus === optimizedDependencyOutdatedStatus &&
      entry.name.includes("/deps/")
    ) {
      return entry.name
    }
  }

  return null
}

function createRuntimeError({
  error,
  filePath,
  kind = "unknown",
  recoverable = false,
  stage,
}: {
  error: unknown
  filePath: string
  kind?: ArtifactRuntimeErrorKind
  recoverable?: boolean
  stage: ArtifactRuntimeErrorStage
}): ArtifactRuntimeError {
  return {
    filePath,
    kind,
    message: errorMessage(error),
    recoverable,
    stack: errorStack(error),
    stage,
  }
}

async function defaultImportModule(url: string) {
  const staticArtifacts = globalThis.__AGENT_HTML_STATIC_ARTIFACTS__
  if (staticArtifacts && isArtifactBundleUrl(url)) {
    const filePath = new URL(url, globalThis.location.href).searchParams.get(
      "filePath"
    )
    const module = filePath ? staticArtifacts[filePath] : null

    if (!module) {
      throw new Error(`Static artifact not found: ${filePath ?? ""}`)
    }

    return module
  }

  return import(/* @vite-ignore */ url) as Promise<ArtifactModule>
}

async function classifyBundleLoadFailure({
  error,
  fetchBundle,
  filePath,
  url,
}: {
  error: unknown
  fetchBundle: (url: string) => Promise<Response>
  filePath: string
  url: string
}): Promise<ArtifactRuntimeError> {
  try {
    const response = await fetchBundle(url)
    const details = await response.text().then(
      (text) => text.slice(0, 500),
      () => ""
    )

    if (!response.ok) {
      return {
        details,
        filePath,
        kind: response.status >= 500 ? "transform-error" : "http-error",
        message: errorMessage(error),
        recoverable: response.status >= 500,
        stage: "bundle-load",
        statusCode: response.status,
      }
    }

    const optimizedDependencyUrl = recentOptimizedDependencyFailure()
    if (optimizedDependencyUrl) {
      return {
        details: optimizedDependencyUrl,
        filePath,
        kind: "optimized-dependency-outdated",
        message: errorMessage(error),
        recoverable: true,
        stack: errorStack(error),
        stage: "bundle-load",
        statusCode: optimizedDependencyOutdatedStatus,
      }
    }

    return {
      details,
      filePath,
      kind: "module-graph-error",
      message: errorMessage(error),
      recoverable: false,
      stack: errorStack(error),
      stage: "bundle-load",
      statusCode: response.status,
    }
  } catch (preflightError) {
    return {
      details: errorMessage(preflightError),
      filePath,
      kind: "server-unavailable",
      message: errorMessage(error),
      recoverable: true,
      stack: errorStack(error),
      stage: "bundle-load",
    }
  }
}

async function disposeArtifact(dispose: (() => void) | null) {
  if (!dispose) {
    return
  }

  await Promise.resolve()
  dispose()
}

export class ArtifactRuntimeController {
  #activeFilePath: string | null = null
  #activeVersion = 0
  #currentRequestId = 0
  #dispose: (() => void) | null = null
  #element: HTMLElement | null = null
  #failureSeriesKey: string | null = null
  #fetchBundle: (url: string) => Promise<Response>
  #importModule: (url: string) => Promise<ArtifactModule>
  #listeners = new Set<ArtifactRuntimeListener>()
  #mountedElement: HTMLElement | null = null
  #mountedVersion: number | null = null
  #onMounted: () => void
  #recoverableRetryCount = 0
  #retryTimer: number | null = null
  #snapshot = emptySnapshot

  constructor({
    fetchBundle = (url) => fetch(url),
    importModule = defaultImportModule,
    onMounted = () => {},
  }: ArtifactRuntimeOptions = {}) {
    this.#fetchBundle = fetchBundle
    this.#importModule = importModule
    this.#onMounted = onMounted
  }

  getSnapshot() {
    return this.#snapshot
  }

  subscribe(listener: ArtifactRuntimeListener) {
    this.#listeners.add(listener)

    return () => {
      this.#listeners.delete(listener)
    }
  }

  setElement(element: HTMLElement | null) {
    this.#element = element
  }

  load(filePath: string | null, version = this.#activeVersion) {
    const requestId = this.#currentRequestId + 1
    this.#currentRequestId = requestId
    return this.#load(requestId, filePath, version)
  }

  retry() {
    if (!this.#activeFilePath || !this.#snapshot.error?.recoverable) {
      return Promise.resolve()
    }

    return this.#retryActive()
  }

  dispose() {
    const requestId = this.#currentRequestId + 1
    this.#currentRequestId = requestId
    this.#clearRetryTimer()
    return this.#disposeCurrent(requestId, null)
  }

  async #retryActive() {
    const requestId = this.#currentRequestId + 1
    this.#currentRequestId = requestId
    return this.#load(requestId, this.#activeFilePath, this.#activeVersion)
  }

  async #load(requestId: number, filePath: string | null, version: number) {
    this.#clearRetryTimer()
    this.#activeFilePath = filePath
    this.#activeVersion = version

    if (!filePath || !this.#element) {
      await this.#disposeCurrent(requestId, null)
      if (requestId === this.#currentRequestId) {
        this.#setSnapshot(emptySnapshot)
      }
      return
    }

    if (
      this.#snapshot.status === "mounted" &&
      this.#snapshot.mountedFilePath === filePath &&
      this.#mountedVersion === version &&
      !this.#snapshot.error
    ) {
      this.#onMounted()
      return
    }

    const mountedFilePath = this.#snapshot.mountedFilePath
    this.#setSnapshot({
      error: null,
      mountedFilePath,
      status: "loading",
    })

    const url = artifactBundleUrl(filePath, version)
    let module
    try {
      module = await this.#importModule(url)
    } catch (error) {
      if (requestId !== this.#currentRequestId) {
        return
      }

      const runtimeError = await classifyBundleLoadFailure({
        error,
        fetchBundle: this.#fetchBundle,
        filePath,
        url,
      })
      this.#setSnapshot({
        error: runtimeError,
        mountedFilePath,
        status: "failed",
      })
      this.#scheduleRecoverableRetry({
        error: runtimeError,
        filePath,
        requestId,
        version,
      })
      return
    }

    if (requestId !== this.#currentRequestId || !this.#element) {
      return
    }

    try {
      const previousDispose = this.#dispose
      const previousElement = this.#mountedElement
      const previousMountedFilePath = this.#snapshot.mountedFilePath
      const nextElement = this.#createMountElement()
      const nextDispose = module.mount(nextElement)
      this.#dispose = nextDispose
      this.#mountedElement = nextElement
      this.#mountedVersion = version
      this.#resetRecoverableRetryState()
      this.#setSnapshot({
        error: null,
        mountedFilePath: filePath,
        status: "mounted",
      })
      this.#onMounted()

      if (previousDispose) {
        await this.#disposePrevious({
          dispose: previousDispose,
          filePath: previousMountedFilePath ?? filePath,
          mountedElement: previousElement,
          requestId,
        })
      }
    } catch (error) {
      this.#setSnapshot({
        error: createRuntimeError({
          error,
          filePath,
          kind: "unknown",
          stage: "mount",
        }),
        mountedFilePath,
        status: "failed",
      })
      return
    }
  }

  async #disposeCurrent(requestId: number, nextFilePath: string | null) {
    const dispose = this.#dispose
    const mountedElement = this.#mountedElement
    this.#dispose = null
    this.#mountedElement = null
    this.#mountedVersion = null

    if (!dispose) {
      this.#element?.replaceChildren()
      return
    }

    this.#setSnapshot({
      error: null,
      mountedFilePath: this.#snapshot.mountedFilePath,
      status: "disposing",
    })

    try {
      await disposeArtifact(dispose)
      mountedElement?.remove()
    } catch (error) {
      if (requestId !== this.#currentRequestId) {
        return
      }

      this.#setSnapshot({
        error: createRuntimeError({
          error,
          filePath: this.#snapshot.mountedFilePath ?? nextFilePath ?? "",
          kind: "unknown",
          stage: "dispose",
        }),
        mountedFilePath: null,
        status: "failed",
      })
    }
  }

  async #disposePrevious({
    dispose,
    filePath,
    mountedElement,
    requestId,
  }: {
    dispose: () => void
    filePath: string
    mountedElement: HTMLElement | null
    requestId: number
  }) {
    try {
      await disposeArtifact(dispose)
      mountedElement?.remove()
    } catch (error) {
      if (requestId !== this.#currentRequestId) {
        return
      }

      this.#setSnapshot({
        error: createRuntimeError({
          error,
          filePath,
          kind: "unknown",
          stage: "dispose",
        }),
        mountedFilePath: this.#snapshot.mountedFilePath,
        status: "failed",
      })
    }
  }

  #clearRetryTimer() {
    if (this.#retryTimer !== null) {
      globalThis.clearTimeout(this.#retryTimer)
      this.#retryTimer = null
    }
  }

  #resetRecoverableRetryState() {
    this.#failureSeriesKey = null
    this.#recoverableRetryCount = 0
  }

  #scheduleRecoverableRetry({
    error,
    filePath,
    requestId,
    version,
  }: {
    error: ArtifactRuntimeError
    filePath: string
    requestId: number
    version: number
  }) {
    if (
      !error.recoverable ||
      (error.kind !== "server-unavailable" &&
        error.kind !== "optimized-dependency-outdated") ||
      typeof globalThis.setTimeout !== "function"
    ) {
      return
    }

    const failureSeriesKey = `${filePath}\u0000${version}\u0000${error.kind}`
    if (this.#failureSeriesKey !== failureSeriesKey) {
      this.#failureSeriesKey = failureSeriesKey
      this.#recoverableRetryCount = 0
    }

    if (this.#recoverableRetryCount >= maxAutomaticRecoveries) {
      return
    }

    this.#recoverableRetryCount += 1
    const delay = 500 * this.#recoverableRetryCount

    this.#retryTimer = globalThis.setTimeout(() => {
      if (requestId === this.#currentRequestId) {
        void this.retry()
      }
    }, delay) as unknown as number
  }

  #createMountElement() {
    if (!this.#element) {
      throw new Error("Artifact root element is required")
    }

    const element = this.#element.ownerDocument.createElement("div")
    this.#element.appendChild(element)
    return element
  }

  #setSnapshot(snapshot: ArtifactRuntimeSnapshot) {
    this.#snapshot = snapshot
    for (const listener of this.#listeners) {
      listener(snapshot)
    }
  }
}

export function formatArtifactRuntimeError(error: ArtifactRuntimeError) {
  const stageLabels: Record<ArtifactRuntimeErrorStage, string> = {
    "bundle-load": "Bundle load failed",
    dispose: "Artifact cleanup failed",
    mount: "Artifact mount failed",
  }

  return `${stageLabels[error.stage]} for ${error.filePath}: ${error.message}`
}

export function useArtifactRuntime({
  activeFilePath,
  artifactRegistryVersion,
  onMounted,
}: {
  activeFilePath: string | null
  artifactRegistryVersion: number
  onMounted: () => void
}) {
  const onMountedRef = React.useRef(onMounted)
  const [snapshot, setSnapshot] = React.useState<ArtifactRuntimeSnapshot>(
    emptySnapshot
  )
  const controllerRef = React.useRef<ArtifactRuntimeController | null>(null)
  const [element, setElement] = React.useState<HTMLElement | null>(null)

  onMountedRef.current = onMounted

  if (!controllerRef.current) {
    controllerRef.current = new ArtifactRuntimeController({
      onMounted: () => onMountedRef.current(),
    })
  }

  React.useEffect(() => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    return controller.subscribe(setSnapshot)
  }, [])

  React.useEffect(() => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    controller.setElement(element)
    void controller.load(activeFilePath, artifactRegistryVersion)
  }, [activeFilePath, artifactRegistryVersion, element])

  React.useEffect(() => {
    const controller = controllerRef.current

    return () => {
      void controller?.dispose()
    }
  }, [])

  React.useEffect(() => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    const recover = () => {
      void controller.retry()
    }

    window.addEventListener("focus", recover)
    document.addEventListener("visibilitychange", recover)

    if (import.meta.hot) {
      import.meta.hot.on("vite:ws:connect", recover)
    }

    return () => {
      window.removeEventListener("focus", recover)
      document.removeEventListener("visibilitychange", recover)
      import.meta.hot?.off("vite:ws:connect", recover)
    }
  }, [])

  return {
    runtime: snapshot,
    setArtifactElement: setElement,
  }
}
