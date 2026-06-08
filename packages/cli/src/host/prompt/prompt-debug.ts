declare global {
  interface Window {
    __agentHtmlLastPrompt?: string
  }
}

export const canvasPromptDebugEventName = "agent-html:prompt-debug"
export const canvasPromptDebugStorageKey = "agent-html:debug-prompts"

export type CanvasPromptDebugEventDetail = {
  prompt: string
}

export function publishCanvasPromptDebug(prompt: string) {
  window.__agentHtmlLastPrompt = prompt
  window.dispatchEvent(
    new CustomEvent<CanvasPromptDebugEventDetail>(canvasPromptDebugEventName, {
      detail: { prompt },
    })
  )

  if (window.localStorage.getItem(canvasPromptDebugStorageKey) === "true") {
    console.info("[agent-html] block prompt\n%s", prompt)
  }
}
