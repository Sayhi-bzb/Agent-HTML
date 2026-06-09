import { describe, expect, it } from "vitest"

import {
  createHostTranslator,
  formatHostMessage,
  resolveCanvasHostLocale,
} from "./host-i18n"
import { hostMessages } from "./messages"

describe("host i18n", () => {
  it("keeps locale dictionaries aligned", () => {
    expect(Object.keys(hostMessages.zh).sort()).toEqual(
      Object.keys(hostMessages.en).sort()
    )
  })

  it("resolves explicit and system host languages", () => {
    expect(
      resolveCanvasHostLocale({
        language: "zh",
        navigatorLanguage: "en-US",
      })
    ).toBe("zh")
    expect(
      resolveCanvasHostLocale({
        language: "en",
        navigatorLanguage: "zh-CN",
      })
    ).toBe("en")
    expect(
      resolveCanvasHostLocale({
        language: "system",
        navigatorLanguage: "zh-CN",
      })
    ).toBe("zh")
    expect(
      resolveCanvasHostLocale({
        language: "system",
        navigatorLanguage: "fr-FR",
      })
    ).toBe("en")
  })

  it("formats messages with interpolation values", () => {
    expect(formatHostMessage("Reply to {title}", { title: "Summary" })).toBe(
      "Reply to Summary"
    )
    expect(formatHostMessage("Keep {missing}")).toBe("Keep {missing}")
  })

  it("creates locale translators", () => {
    expect(createHostTranslator("zh")("sidebar.newArtifact")).toBe(
      "新建 Artifact"
    )
    expect(createHostTranslator("en")("sidebar.newArtifact")).toBe(
      "New Artifact"
    )
  })
})

