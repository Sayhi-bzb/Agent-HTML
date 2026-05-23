export type AgentHtmlValidationCode =
  | "UNKNOWN_TAG"
  | "UNKNOWN_ATTR"
  | "INVALID_CHILD"
  | "MISSING_REQUIRED_ATTR"
  | "TEXT_NOT_ALLOWED"
  | "MISSING_REQUIRED_CHILD"

export type AgentHtmlValidationError = {
  code: AgentHtmlValidationCode
  message: string
  path: string
  tag?: string
  attr?: string
}
