import { describe, expect, it } from "vitest"

import { formatCodexWorkspacePath } from "@/app/workspace/codex-path"

describe("formatCodexWorkspacePath", () => {
  it("returns paths relative to the Codex workspace root", () => {
    expect(
      formatCodexWorkspacePath(
        "C:\\Users\\Administrator\\AppData\\Roaming\\Agent-HTML\\AgentHTML\\projects\\project-1\\section-1\\artifact.agent-html",
        "C:\\Users\\Administrator\\AppData\\Roaming\\Agent-HTML\\AgentHTML"
      )
    ).toBe("projects/project-1/section-1/artifact.agent-html")
  })

  it("handles custom roots and trailing slashes", () => {
    expect(
      formatCodexWorkspacePath(
        "D:\\AgentHTML\\projects\\project-1\\section-1\\artifact.agent-html",
        "D:/AgentHTML/"
      )
    ).toBe("projects/project-1/section-1/artifact.agent-html")
  })

  it("keeps skill reference workspace-relative paths stable", () => {
    expect(
      formatCodexWorkspacePath(
        ".agents\\skills\\agent-html\\references\\prompt-schema.md",
        "D:\\AgentHTML"
      )
    ).toBe(".agents/skills/agent-html/references/prompt-schema.md")
  })

  it("keeps agent-world workspace-relative paths stable", () => {
    expect(
      formatCodexWorkspacePath(
        ".agent-world\\logs\\agent-html-codex-connection-trace.jsonl",
        "D:\\AgentHTML"
      )
    ).toBe(".agent-world/logs/agent-html-codex-connection-trace.jsonl")
  })

  it("rejects root-level relative paths that are not workspace surfaces", () => {
    expect(() =>
      formatCodexWorkspacePath(
        "notes.md",
        "D:\\AgentHTML"
      )
    ).toThrow("outside the Codex workspace root")
  })

  it("rejects an absolute path outside the workspace root", () => {
    expect(() =>
      formatCodexWorkspacePath(
        "D:\\external\\notes\\source.agent-html",
        "D:\\AgentHTML"
      )
    ).toThrow("outside the Codex workspace root")
  })
})
