import { describe, expect, it } from "vitest"

import { buildScenarioSurfaceState } from "@/app/gallery/agent-lab/runtime"
import { agentEventScenarios } from "@/app/gallery/agent-lab/scenarios"

describe("buildScenarioSurfaceState", () => {
  it("keeps message deltas in Pet and Drawer before a block outcome exists", () => {
    const scenario = agentEventScenarios.find(
      (item) => item.id === "long-streaming-response"
    )

    expect(scenario).toBeDefined()

    const state = buildScenarioSurfaceState(scenario!.events, 4)

    expect(state.petActivity.kind).toBe("speaking")
    expect(state.drawerEvents).toHaveLength(4)
    expect(state.blockMarkers["hero.title"]?.cards ?? []).toHaveLength(0)
  })

  it("creates a block comment marker only after a completed block outcome", () => {
    const scenario = agentEventScenarios.find(
      (item) => item.id === "block-rewrite-success"
    )

    expect(scenario).toBeDefined()

    const state = buildScenarioSurfaceState(scenario!.events, scenario!.events.length)

    expect(state.blockMarkers["hero.body"]?.status).toBe("done")
    expect(state.blockMarkers["hero.body"]?.cards).toHaveLength(1)
    expect(state.petActivity.kind).toBe("review")
  })

  it("keeps document-level analysis out of block markers", () => {
    const scenario = agentEventScenarios.find(
      (item) => item.id === "document-level-analysis"
    )

    expect(scenario).toBeDefined()

    const state = buildScenarioSurfaceState(scenario!.events, scenario!.events.length)

    expect(Object.keys(state.blockMarkers)).toHaveLength(0)
    expect(state.documentOutcomes).toHaveLength(1)
    expect(state.petActivity.kind).toBe("review")
  })

  it("tracks separate block outcomes during a multi-block pass", () => {
    const scenario = agentEventScenarios.find(
      (item) => item.id === "multi-block-tone-pass"
    )

    expect(scenario).toBeDefined()

    const state = buildScenarioSurfaceState(scenario!.events, scenario!.events.length)

    expect(state.blockMarkers["hero.title"]?.cards).toHaveLength(1)
    expect(state.blockMarkers["summary.card"]?.cards).toHaveLength(1)
    expect(state.blockMarkers["cta.actions"]?.cards).toHaveLength(1)
  })
})
