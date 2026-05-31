type PetMood = "failed" | "idle" | "review" | "waiting" | "working"

export type PetActionKind =
  | "editing"
  | "reading"
  | "running"
  | "searching"
  | "speaking"
  | "testing"
  | "thinking"
  | "waiting"

export type PetPresence = {
  action?: {
    kind: PetActionKind
    label: string
  }
  message?: {
    mode: "final" | "streaming" | "transient"
    text: string
  }
  mood: PetMood
}

export type PetSpeechBubble = {
  createdAt: string
  id: string
  mode: "exiting" | "final" | "streaming"
  text: string
}
