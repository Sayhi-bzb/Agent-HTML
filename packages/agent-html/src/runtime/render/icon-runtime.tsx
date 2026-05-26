import { DynamicIcon, iconNames } from "lucide-react/dynamic"

export function IconRuntime({ name }: { name: string }) {
  const iconName = name as (typeof iconNames)[number]

  return (
    <DynamicIcon
      aria-hidden="true"
      className="size-4 shrink-0"
      fallback={() => (
        <span
          aria-hidden="true"
          className="inline-flex size-4 shrink-0"
          data-slot="icon-fallback"
        />
      )}
      name={iconName}
      stroke="currentColor"
    />
  )
}
