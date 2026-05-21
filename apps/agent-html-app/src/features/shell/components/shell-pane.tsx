import {
  ShellEmptyCanvas,
  ShellPaneScaffold,
} from "@/features/app-shell/components/shell-content"
export function ShellPane() {
  return (
    <ShellPaneScaffold
      contentClassName="app-shell-pane-content-bleed"
      content={
        <ShellEmptyCanvas>{" "}</ShellEmptyCanvas>
      }
    />
  )
}
