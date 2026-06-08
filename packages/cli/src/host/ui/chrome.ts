import { HostCommandDialog, HostCommandItem } from "./command"
import { HostDropdownContent, HostDropdownItem } from "./dropdown"
import { HostIconButton } from "./icon-button"
import { HostPopoverAction, HostPopoverContent } from "./popover"
import {
  HostSelect,
  HostSelectContent,
  HostSelectItem,
} from "./select"
import {
  HostSidebarAction,
  HostSidebarActionButton,
} from "./sidebar-action"
import { HostSwatch } from "./swatch"

export type { HostSelectOption } from "./select"

export const HostChrome = {
  CommandDialog: HostCommandDialog,
  CommandItem: HostCommandItem,
  DropdownContent: HostDropdownContent,
  DropdownItem: HostDropdownItem,
  Icon: HostIconButton,
  PopoverAction: HostPopoverAction,
  PopoverContent: HostPopoverContent,
  Select: HostSelect,
  SelectContent: HostSelectContent,
  SelectItem: HostSelectItem,
  SidebarAction: HostSidebarAction,
  SidebarButton: HostSidebarActionButton,
  Swatch: HostSwatch,
}
