import * as React from "react"
import {
  LoaderCircleIcon,
  RefreshCwIcon,
  TerminalSquareIcon,
} from "lucide-react"

import type {
  CodexThread,
  CodexTranscript,
  CodexTranscriptItem,
} from "../api/api"
import { useHostI18n } from "../i18n/host-i18n"
import { fetchPipelineTranscript } from "../pipeline"
import { HostButton } from "../ui/button"
import { codexThreadLabel } from "./thread-label"

function transcriptItemText(item: CodexTranscriptItem) {
  return (
    item.contentText ??
    item.summaryText ??
    item.resultText ??
    item.aggregatedOutput ??
    item.query ??
    item.command ??
    item.argumentsText ??
    ""
  )
}

function TranscriptItem({ item }: { item: CodexTranscriptItem }) {
  const { t } = useHostI18n()
  const text = transcriptItemText(item)
  const detail = item.aggregatedOutput ?? item.resultText
  const label =
    item.tool ?? item.command ?? item.type ?? t("threads.itemUntitled")
  const operational = Boolean(
    item.tool || item.command || item.aggregatedOutput || item.argumentsText
  )

  return (
    <article
      className="canvas-thread-transcript-item"
      data-operational={operational ? "" : undefined}
    >
      <header>
        {operational ? <TerminalSquareIcon aria-hidden="true" /> : null}
        <strong>{label}</strong>
        {item.status ? <span>{item.status}</span> : null}
      </header>
      {text ? <p>{text}</p> : null}
      {detail && detail !== text ? <pre>{detail}</pre> : null}
    </article>
  )
}

export function CodexThreadSurface({ thread }: { thread: CodexThread }) {
  const { t } = useHostI18n()
  const [transcript, setTranscript] = React.useState<CodexTranscript | null>(
    null
  )
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      setTranscript(await fetchPipelineTranscript(thread.id))
      setError(null)
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error ? loadError.message : String(loadError)
      )
    } finally {
      setLoading(false)
    }
  }, [thread.id])

  React.useEffect(() => {
    let current = true
    void fetchPipelineTranscript(thread.id)
      .then((nextTranscript) => {
        if (!current) return
        setTranscript(nextTranscript)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!current) return
        setError(
          loadError instanceof Error ? loadError.message : String(loadError)
        )
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [thread.id])

  const label = codexThreadLabel(thread)

  return (
    <main className="canvas-surface-root canvas-thread-transcript">
      <div className="canvas-thread-transcript-frame">
        <header className="canvas-thread-transcript-header">
          <div>
            <h1>{label}</h1>
            <p>{t("threads.historyDescription")}</p>
          </div>
          <HostButton
            aria-label={t("threads.refresh")}
            disabled={loading}
            onClick={() => void refresh()}
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
            <span>{t("threads.historyUnavailable")}</span>
            <small>{error}</small>
            <HostButton
              disabled={loading}
              onClick={() => void refresh()}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("threads.retry")}
            </HostButton>
          </div>
        ) : null}

        {loading && !transcript ? (
          <div
            aria-label={t("threads.historyLoading")}
            className="canvas-thread-manager-skeleton"
            role="status"
          >
            {[0, 1, 2, 3].map((index) => (
              <span aria-hidden="true" key={index} />
            ))}
          </div>
        ) : null}

        {!loading && !error && transcript?.turns.length === 0 ? (
          <p className="canvas-thread-manager-empty">
            {t("threads.historyEmpty")}
          </p>
        ) : null}

        {transcript?.turns.map((turn) => (
          <section
            aria-label={turn.id}
            className="canvas-thread-transcript-turn"
            key={turn.id}
          >
            {turn.items.map((item) => (
              <TranscriptItem item={item} key={item.id} />
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}
