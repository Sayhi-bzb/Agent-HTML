import { HostCommandDialog, HostCommandItem } from "./command"
import { HostDropdownContent, HostDropdownItem } from "./dropdown"
import { HostPopoverAction, HostPopoverContent } from "./popover"
import {
  HostSelect,
  HostSelectContent,
  HostSelectItem,
} from "./select"

export type { HostSelectOption } from "./select"

export const HostMenu = {
  CommandDialog: HostCommandDialog,
  CommandItem: HostCommandItem,
  DropdownContent: HostDropdownContent,
  DropdownItem: HostDropdownItem,
  PopoverAction: HostPopoverAction,
  PopoverContent: HostPopoverContent,
  Select: HostSelect,
  SelectContent: HostSelectContent,
  SelectItem: HostSelectItem,
}
