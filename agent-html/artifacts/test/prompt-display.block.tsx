import { useEffect, useState } from "react"

import { ScrollArea } from "../../components/ui/scroll-area"

const promptDebugEventName = "agent-html:prompt-debug"

declare global {
  interface Window {
    __agentHtmlLastPrompt?: string
  }
}

export function PromptDisplayBlock() {
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    // Special host debug bridge for this example only; do not copy into ordinary artifacts.
    setPrompt(window.__agentHtmlLastPrompt ?? "")

    function handlePromptDebug(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return
      }

      const detail = event.detail as { prompt?: unknown }

      if (typeof detail.prompt === "string") {
        setPrompt(detail.prompt)
      }
    }

    window.addEventListener(promptDebugEventName, handlePromptDebug)

    return () => {
      window.removeEventListener(promptDebugEventName, handlePromptDebug)
    }
  }, [])

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Prompt display</h2>
        <p className="canvas-text-body text-muted-foreground">
          Submit a block prompt to preview the generated request.
        </p>
      </div>

      <ScrollArea className="h-96 rounded-md border bg-muted/30">
        {prompt ? (
          <pre className="whitespace-pre-wrap p-4 text-sm">{prompt}</pre>
        ) : (
          <div className="p-4">
            <p className="canvas-text-body text-muted-foreground">
              No generated prompt yet.
            </p>
          </div>
        )}
      </ScrollArea>
    </section>
  )
}
