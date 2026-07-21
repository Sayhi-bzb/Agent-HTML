import {
  CheckIcon,
  LoaderCircleIcon,
  MessageSquareTextIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react"

import type { CodexThread } from "../api/api"
import { useHostI18n } from "../i18n/host-i18n"
import { HostButton } from "../ui/button"
import { codexThreadLabel, shortCodexThreadId } from "./thread-label"

function ThreadManagerRow({
  active,
  description,
  label,
  onSelect,
  variant = "thread",
}: {
  active: boolean
  description?: string
  label: string
  onSelect: () => void
  variant?: "new" | "thread"
}) {
  const Icon = variant === "new" ? PlusIcon : MessageSquareTextIcon

  return (
    <li>
      <HostButton
        aria-pressed={active}
        className="canvas-thread-manager-row"
        data-active={active ? "" : undefined}
        onClick={onSelect}
        title={label}
        type="button"
        variant="ghost"
      >
        <Icon aria-hidden="true" className="canvas-thread-manager-row-icon" />
        <span className="canvas-thread-manager-row-content">
          <span className="canvas-thread-manager-row-label">{label}</span>
          {description ? (
            <span className="canvas-thread-manager-row-description">
              {description}
            </span>
          ) : null}
        </span>
        {active ? (
          <CheckIcon
            aria-hidden="true"
            className="canvas-thread-manager-row-check"
          />
        ) : null}
      </HostButton>
    </li>
  )
}

function ThreadManagerSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      className="canvas-thread-manager-skeleton"
      role="status"
    >
      {[0, 1, 2, 3].map((index) => (
        <span aria-hidden="true" key={index} />
      ))}
    </div>
  )
}

export function CodexThreadManagerSurface({
  activeThreadId,
  error,
  loading,
  onRefresh,
  onSelectThread,
  threads,
}: {
  activeThreadId: string | null
  error: string | null
  loading: boolean
  onRefresh: () => void
  onSelectThread: (threadId: string | null) => void
  threads: CodexThread[]
}) {
  const { t } = useHostI18n()
  const activeThread = activeThreadId
    ? threads.find((thread) => thread.id === activeThreadId)
    : null
  const missingActiveThreadId =
    activeThreadId && !activeThread && !loading ? activeThreadId : null

  return (
    <main className="canvas-surface-root canvas-thread-manager">
      <div className="canvas-thread-manager-frame">
        <header className="canvas-thread-manager-header">
          <div>
            <h1>{t("threads.title")}</h1>
            <p>{t("threads.description")}</p>
          </div>
          <HostButton
            aria-label={t("threads.refresh")}
            disabled={loading}
            onClick={onRefresh}
            size="icon-sm"
            title={t("threads.refresh")}
            type="button"
            variant="ghost"
          >
            {loading ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="canvas-thread-manager-spinner"
              />
            ) : (
              <RefreshCwIcon aria-hidden="true" />
            )}
          </HostButton>
        </header>

        {error ? (
          <div className="canvas-thread-manager-error" role="alert">
            <span>{t("threads.unavailable")}</span>
            <small>{error}</small>
            <HostButton
              disabled={loading}
              onClick={onRefresh}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("threads.retry")}
            </HostButton>
          </div>
        ) : null}

        <ul
          aria-label={t("threads.title")}
          className="canvas-thread-manager-list"
        >
          <ThreadManagerRow
            active={activeThreadId === null}
            label={t("threads.new")}
            onSelect={() => onSelectThread(null)}
            variant="new"
          />
          {missingActiveThreadId ? (
            <ThreadManagerRow
              active
              description={t("threads.missing")}
              label={shortCodexThreadId(missingActiveThreadId)}
              onSelect={() => onSelectThread(missingActiveThreadId)}
            />
          ) : null}
          {threads.map((thread) => {
            const label = codexThreadLabel(thread)
            const preview = thread.preview?.trim()
            const description =
              preview && preview !== label ? preview : undefined

            return (
              <ThreadManagerRow
                active={thread.id === activeThreadId}
                description={description}
                key={thread.id}
                label={label}
                onSelect={() => onSelectThread(thread.id)}
              />
            )
          })}
        </ul>

        {loading && threads.length === 0 ? (
          <ThreadManagerSkeleton label={t("threads.loading")} />
        ) : null}
        {!loading && !error && threads.length === 0 ? (
          <p className="canvas-thread-manager-empty">{t("threads.empty")}</p>
        ) : null}
      </div>
    </main>
  )
}
