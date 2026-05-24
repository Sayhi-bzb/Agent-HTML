export type SourceTabValue = "ahtml" | "html" | "react"

export const sourceTabValues: SourceTabValue[] = ["ahtml", "html", "react"]

export function isSourceTabValue(value: string): value is SourceTabValue {
  return sourceTabValues.includes(value as SourceTabValue)
}
