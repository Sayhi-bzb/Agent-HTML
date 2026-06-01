import { describe, expect, it, vi } from "vitest"

import {
  createConfigValueWriteMutation,
  createMcpOauthLoginMutation,
  createMcpReloadMutation,
  createPluginInstallMutation,
  createPluginUninstallMutation,
  createSkillConfigMutation,
  createWriteCodexTextFileMutation,
  readCodexSettingsItems,
  readCodexTextFile,
  resolveRootAgentsPath,
} from "./codex-settings-service"

describe("codex settings service", () => {
  it("resolves AGENTS.md under the active workspace root", () => {
    expect(
      resolveRootAgentsPath({
        defaultRootPath: "D:\\codes\\Agent-HTML",
        pendingRootPath: "D:\\codes\\Agent-HTML",
        rootPath: "D:\\codes\\Agent-HTML\\",
        settings: { rootPath: "" },
      })
    ).toBe("D:\\codes\\Agent-HTML\\AGENTS.md")

    expect(
      resolveRootAgentsPath({
        defaultRootPath: "/repo",
        pendingRootPath: "/repo",
        rootPath: "/repo/",
        settings: { rootPath: "" },
      })
    ).toBe("/repo/AGENTS.md")
  })

  it("reads text files through the Codex fs/readFile API", async () => {
    const request = vi.fn().mockResolvedValue({ content: "instructions" })

    await expect(readCodexTextFile(request, "/repo/AGENTS.md")).resolves.toBe(
      "instructions"
    )
    expect(request).toHaveBeenCalledWith("fs/readFile", {
      path: "/repo/AGENTS.md",
    })
  })

  it("creates official Codex app-server mutations", () => {
    expect(createWriteCodexTextFileMutation("/repo/AGENTS.md", "x")).toMatchObject({
      method: "fs/writeFile",
      params: { content: "x", path: "/repo/AGENTS.md" },
    })
    expect(createMcpReloadMutation().method).toBe("config/mcpServer/reload")
    expect(createMcpOauthLoginMutation("github").params).toEqual({
      name: "github",
    })
    expect(
      createConfigValueWriteMutation({
        description: "Disable GitHub app.",
        keyPath: "apps.github.enabled",
        title: "Disable app",
        value: false,
      })
    ).toMatchObject({
      method: "config/value/write",
      params: {
        keyPath: "apps.github.enabled",
        mergeStrategy: "replace",
        value: false,
      },
    })
    expect(
      createSkillConfigMutation({ name: "docs", path: "/skills/docs" }, false)
    ).toMatchObject({
      method: "skills/config/write",
      params: { enabled: false, path: "/skills/docs" },
    })
    expect(
      createPluginInstallMutation({ name: "review", path: "/market/review" })
    ).toMatchObject({
      method: "plugin/install",
      params: { marketplacePath: "/market/review" },
    })
    expect(createPluginUninstallMutation({ id: "review", name: "Review" })).toMatchObject({
      method: "plugin/uninstall",
      params: { name: "review" },
    })
  })

  it("normalizes nested capability payloads into settings items", () => {
    expect(
      readCodexSettingsItems({
        source: { path: "/repo" },
        skills: [{ enabled: true, name: "agent-html", path: "/repo/skill" }],
      })
    ).toEqual([
      {
        enabled: true,
        id: "agent-html",
        installed: undefined,
        name: "agent-html",
        path: "/repo/skill",
        source: "/repo",
        status: undefined,
      },
    ])
  })
})
