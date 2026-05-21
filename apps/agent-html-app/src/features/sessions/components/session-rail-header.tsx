import { PlusIcon, SearchIcon } from "lucide-react"

import {
  ShellIconButton,
  ShellPaneHeader,
  ShellPaneLabel,
  ShellSearchField,
} from "@/features/app-shell/components/shell-content"

type SessionRailHeaderProps = {
  query: string
  disabled: boolean
  onCreateSession: () => void
  onQueryChange: (value: string) => void
}

export function SessionRailHeader({
  query,
  disabled,
  onCreateSession,
  onQueryChange,
}: SessionRailHeaderProps) {
  return (
    <ShellPaneHeader
      leading={
        <div className="app-shell-section-stack w-full">
          <ShellPaneLabel icon={<SearchIcon className="app-shell-inline-icon" />} title="Sessions" />
          <ShellSearchField
            disabled={disabled}
            icon={<SearchIcon />}
            onChange={onQueryChange}
            placeholder="Find"
            value={query}
          />
        </div>
      }
      trailing={
        <ShellIconButton
          ariaLabel="Create session"
          className="border-0"
          disabled={disabled}
          onClick={onCreateSession}
        >
          <PlusIcon data-icon="inline-start" />
        </ShellIconButton>
      }
    />
  )
}
