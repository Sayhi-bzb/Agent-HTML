import { PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShellPaneHeader } from "@/features/app-shell/components/shell-content"

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
        <div className="app-shell-search-field">
          <SearchIcon className="app-shell-search-icon" />
          <Input
            className="app-shell-search-input"
            disabled={disabled}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search"
            value={query}
          />
        </div>
      }
      trailing={
        <Button
          aria-label="Create session"
          disabled={disabled}
          onClick={onCreateSession}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <PlusIcon data-icon="inline-start" />
        </Button>
      }
    />
  )
}
