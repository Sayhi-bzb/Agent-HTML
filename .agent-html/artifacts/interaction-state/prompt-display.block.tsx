import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { ScrollArea } from "../../ui/scroll-area"

const promptDebugEventName = "agent-html:prompt-debug"

declare global {
  interface Window {
    __agentHtmlLastPrompt?: string
  }
}

export function PromptDisplayBlock() {
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
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
    <Card>
      <CardHeader>
        <CardTitle>Prompt display</CardTitle>
        <CardDescription>
          Submit a block prompt to preview the generated request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 rounded-lg border bg-muted/30">
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
      </CardContent>
    </Card>
  )
}
