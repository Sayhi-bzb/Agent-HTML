import iconNamesSource from "../../../../.agents/skills/agent-html/references/icon-names.txt?raw"

export type LucideIconName = string

const iconNames = iconNamesSource
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))

const iconNameSet = new Set<string>(iconNames)

export function getAllIconNames() {
  return iconNames
}

export function hasIconName(name: string) {
  return iconNameSet.has(name)
}

