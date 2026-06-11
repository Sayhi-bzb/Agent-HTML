export type CrewMember = {
  agency: string
  meaning: string
  name: string
  portraitKey: CrewPortraitKey
  role: string
}

export type CrewPortraitKey =
  | "christinaKoch"
  | "jeremyHansen"
  | "reidWiseman"
  | "victorGlover"

export type MissionRoutePhase = {
  id: string
  label: string
  time: string
  why: string
}

export type SourceLink = {
  label: string
  url: string
}
