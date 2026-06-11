import type { MissionRoutePhase } from "./types"

export const missionRoutePhases: MissionRoutePhase[] = [
  {
    id: "launch",
    label: "Launch",
    time: "Apr 1, 2026",
    why: "This starts the full deep-space system, not only a rocket ascent.",
  },
  {
    id: "earth-orbit-testing",
    label: "Earth Orbit Checkout",
    time: "Flight Day 1",
    why: "The crew stays close enough to Earth while the vehicle proves readiness.",
  },
  {
    id: "trans-lunar-injection",
    label: "Trans-Lunar Injection",
    time: "Flight Day 2 / Apr 2",
    why: "This is the commitment point that turns checkout into deep-space flight.",
  },
  {
    id: "lunar-approach",
    label: "Lunar Approach",
    time: "Flight Day 5",
    why: "The Moon shifts from destination to active navigation environment.",
  },
  {
    id: "lunar-flyby",
    label: "Lunar Flyby",
    time: "Flight Day 6 / Apr 6",
    why: "The Moon becomes a real flight landmark, not an abstract destination.",
  },
  {
    id: "splashdown",
    label: "Return And Splashdown",
    time: "Flight Days 7-10 / Apr 10 PDT",
    why: "Recovery completes the mission as an operational system.",
  },
]
