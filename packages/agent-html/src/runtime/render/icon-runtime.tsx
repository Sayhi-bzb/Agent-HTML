import {
  ActivityIcon,
  AlertCircleIcon,
  BuildingIcon,
  CalendarIcon,
  CodeXmlIcon,
  ComponentIcon,
  RouteIcon,
  ScanLineIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "lucide-react"

const runtimeIcons = {
  activity: ActivityIcon,
  "alert-circle": AlertCircleIcon,
  building: BuildingIcon,
  calendar: CalendarIcon,
  "code-xml": CodeXmlIcon,
  component: ComponentIcon,
  route: RouteIcon,
  "scan-line": ScanLineIcon,
  search: SearchIcon,
  settings: SettingsIcon,
  "shield-check": ShieldCheckIcon,
} as const

export function IconRuntime({ name }: { name: string }) {
  const Icon = runtimeIcons[name as keyof typeof runtimeIcons]

  if (!Icon) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0"
        data-icon-name={name}
        data-slot="icon-fallback"
      />
    )
  }

  return (
    <Icon
      aria-hidden="true"
      className="size-4 shrink-0"
      data-icon-name={name}
      stroke="currentColor"
    />
  )
}
