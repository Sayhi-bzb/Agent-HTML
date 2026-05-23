import { dynamicIconImports, iconNames } from "lucide-react/dynamic"

export type LucideIconName = string

const iconNameSet = new Set<string>(iconNames)

export function getAllIconNames() {
  return iconNames
}

export function hasIconName(name: string) {
  return iconNameSet.has(name)
}

export function getDynamicIconImport(name: string) {
  return dynamicIconImports[name as keyof typeof dynamicIconImports]
}
