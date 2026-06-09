import type { GuardIssue } from "./host-contracts"

function isGuardError(issue: GuardIssue) {
  return issue.severity === "error"
}

export function getHumanVisibleGuardIssues(issues: GuardIssue[]) {
  return issues.filter(isGuardError)
}

export function countHumanVisibleGuardIssues(issues: GuardIssue[]) {
  return getHumanVisibleGuardIssues(issues).length
}

export function getGuardFixIssues(issues: GuardIssue[]) {
  return issues.filter(isGuardError)
}
