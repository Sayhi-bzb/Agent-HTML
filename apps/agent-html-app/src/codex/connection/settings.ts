import type { CodexConnectionSettings } from "./types"

function getDefaultCodexCommand(): string {
  return typeof navigator !== "undefined" && navigator.platform.includes("Win")
    ? "codex.cmd"
    : "codex"
}

function getDefaultSettings(): CodexConnectionSettings {
  return {
    codexCommand: getDefaultCodexCommand(),
  }
}

export function loadSettings(): CodexConnectionSettings {
  return getDefaultSettings()
}

export function validateSettings(settings: CodexConnectionSettings): void {
  if (!settings.codexCommand.trim()) {
    throw new Error("Set the Codex command before connecting.")
  }
}

export function areSettingsEqual(
  left: CodexConnectionSettings,
  right: CodexConnectionSettings
): boolean {
  return left.codexCommand === right.codexCommand
}
