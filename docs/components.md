# Component Facts

This file is a component fact inventory compiled from shadcn registry/source introspection plus current family grouping.

It is not the current runtime support matrix, and it does not define the public agent contract.

## primitive controls

### Button

- Source: shadcn-official (@shadcn/button)
- Exports: `Button`, `buttonVariants`
- Slots / parts: `button`
- Variant props: `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; `size`: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

### Input

- Source: shadcn-official (@shadcn/input)
- Exports: `Input`
- Slots / parts: `input`

### Checkbox

- Source: shadcn-official (@shadcn/checkbox)
- Exports: `Checkbox`
- Slots / parts: `checkbox`, `checkbox-indicator`

### Switch

- Source: shadcn-official (@shadcn/switch)
- Exports: `Switch`
- Slots / parts: `switch`, `switch-thumb`
- Variant props: `size`: `sm`, `default`

### Slider

- Source: shadcn-official (@shadcn/slider)
- Exports: `Slider`
- Slots / parts: `slider`, `slider-track`, `slider-range`, `slider-thumb`

### Radio Group

- Source: shadcn-official (@shadcn/radio-group)
- Exports: `RadioGroup`, `RadioGroupItem`
- Slots / parts: `radio-group`, `radio-group-item`, `radio-group-indicator`

## field composition

### Field

- Source: shadcn-official (@shadcn/field)
- Exports: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`
- Slots / parts: `field-set`, `field-legend`, `field-group`, `field`, `field-content`, `field-label`, `field-description`, `field-separator`, `field-separator-content`, `field-error`
- Variant props: `orientation`: `vertical`, `horizontal`, `responsive`; `variant`: `legend`, `label`

### Input Group

- Source: shadcn-official (@shadcn/input-group)
- Exports: `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`
- Slots / parts: `input-group`, `input-group-addon`, `input-group-control`
- Variant props: `align`: `inline-start`, `inline-end`, `block-start`, `block-end`; `size`: `xs`, `sm`, `icon-xs`, `icon-sm`

### Select

- Source: shadcn-official (@shadcn/select)
- Exports: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`
- Slots / parts: `select`, `select-group`, `select-value`, `select-trigger`, `select-content`, `select-label`, `select-item`, `select-item-indicator`, `select-separator`, `select-scroll-up-button`, `select-scroll-down-button`
- Variant props: `size`: `sm`, `default`

### Combobox

- Source: shadcn-official (@shadcn/combobox)
- Exports: `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxGroup`, `ComboboxLabel`, `ComboboxCollection`, `ComboboxEmpty`, `ComboboxSeparator`, `ComboboxChips`, `ComboboxChip`, `ComboboxChipsInput`, `ComboboxTrigger`, `ComboboxValue`, `useComboboxAnchor`
- Slots / parts: `combobox-value`, `combobox-trigger`, `combobox-trigger-icon`, `combobox-clear`, `input-group-button`, `combobox-content`, `combobox-list`, `combobox-item`, `combobox-item-indicator`, `combobox-group`, `combobox-label`, `combobox-collection`, `combobox-empty`, `combobox-separator`, `combobox-chips`, `combobox-chip`, `combobox-chip-remove`, `combobox-chip-input`

### Date Picker

- Source: shadcn-ecosystem (shadcn docs composition (button + popover + calendar))

## overlay surfaces

### Dialog

- Source: shadcn-official (@shadcn/dialog)
- Exports: `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger`
- Slots / parts: `dialog`, `dialog-trigger`, `dialog-portal`, `dialog-close`, `dialog-overlay`, `dialog-content`, `dialog-header`, `dialog-footer`, `dialog-title`, `dialog-description`

### Drawer

- Source: shadcn-official (@shadcn/drawer)
- Exports: `Drawer`, `DrawerPortal`, `DrawerOverlay`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`
- Slots / parts: `drawer`, `drawer-trigger`, `drawer-portal`, `drawer-close`, `drawer-overlay`, `drawer-content`, `drawer-header`, `drawer-footer`, `drawer-title`, `drawer-description`

### Sheet

- Source: shadcn-official (@shadcn/sheet)
- Exports: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`
- Slots / parts: `sheet`, `sheet-trigger`, `sheet-close`, `sheet-portal`, `sheet-overlay`, `sheet-content`, `sheet-header`, `sheet-footer`, `sheet-title`, `sheet-description`
- Variant props: `side`: `top`, `right`, `bottom`, `left`

### Popover

- Source: shadcn-official (@shadcn/popover)
- Exports: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`
- Slots / parts: `popover`, `popover-trigger`, `popover-content`, `popover-anchor`, `popover-header`, `popover-title`, `popover-description`

### Tooltip

- Source: shadcn-official (@shadcn/tooltip)
- Exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- Slots / parts: `tooltip-provider`, `tooltip`, `tooltip-trigger`, `tooltip-content`

### Hover Card

- Source: shadcn-official (@shadcn/hover-card)
- Exports: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`
- Slots / parts: `hover-card`, `hover-card-trigger`, `hover-card-portal`, `hover-card-content`

### Dropdown Menu

- Source: shadcn-official (@shadcn/dropdown-menu)
- Exports: `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`
- Slots / parts: `dropdown-menu`, `dropdown-menu-portal`, `dropdown-menu-trigger`, `dropdown-menu-content`, `dropdown-menu-group`, `dropdown-menu-item`, `dropdown-menu-checkbox-item`, `dropdown-menu-radio-group`, `dropdown-menu-radio-item`, `dropdown-menu-label`, `dropdown-menu-separator`, `dropdown-menu-shortcut`, `dropdown-menu-sub`, `dropdown-menu-sub-trigger`, `dropdown-menu-sub-content`
- Variant props: `variant`: `default`, `destructive`

### Context Menu

- Source: shadcn-official (@shadcn/context-menu)
- Exports: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`
- Slots / parts: `context-menu`, `context-menu-trigger`, `context-menu-group`, `context-menu-portal`, `context-menu-sub`, `context-menu-radio-group`, `context-menu-sub-trigger`, `context-menu-sub-content`, `context-menu-content`, `context-menu-item`, `context-menu-checkbox-item`, `context-menu-radio-item`, `context-menu-label`, `context-menu-separator`, `context-menu-shortcut`
- Variant props: `variant`: `default`, `destructive`

## navigation

### Breadcrumb

- Source: shadcn-official (@shadcn/breadcrumb)
- Exports: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`
- Slots / parts: `breadcrumb`, `breadcrumb-list`, `breadcrumb-item`, `breadcrumb-link`, `breadcrumb-page`, `breadcrumb-separator`, `breadcrumb-ellipsis`

### Pagination

- Source: shadcn-official (@shadcn/pagination)
- Exports: `Pagination`, `PaginationContent`, `PaginationLink`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`
- Slots / parts: `pagination`, `pagination-content`, `pagination-item`, `pagination-link`, `pagination-ellipsis`

### Menubar

- Source: shadcn-official (@shadcn/menubar)
- Exports: `Menubar`, `MenubarPortal`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarGroup`, `MenubarSeparator`, `MenubarLabel`, `MenubarItem`, `MenubarShortcut`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`
- Slots / parts: `menubar`, `menubar-menu`, `menubar-group`, `menubar-portal`, `menubar-radio-group`, `menubar-trigger`, `menubar-content`, `menubar-item`, `menubar-checkbox-item`, `menubar-radio-item`, `menubar-label`, `menubar-separator`, `menubar-shortcut`, `menubar-sub`, `menubar-sub-trigger`, `menubar-sub-content`
- Variant props: `variant`: `default`, `destructive`

### Navigation Menu

- Source: shadcn-official (@shadcn/navigation-menu)
- Exports: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `navigationMenuTriggerStyle`
- Slots / parts: `navigation-menu`, `navigation-menu-list`, `navigation-menu-item`, `navigation-menu-trigger`, `navigation-menu-content`, `navigation-menu-viewport`, `navigation-menu-link`, `navigation-menu-indicator`

## view switchers

### Tabs

- Source: shadcn-official (@shadcn/tabs)
- Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`
- Slots / parts: `tabs`, `tabs-list`, `tabs-trigger`, `tabs-content`
- Variant props: `variant`: `default`, `line`

### Accordion

- Source: shadcn-official (@shadcn/accordion)
- Exports: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- Slots / parts: `accordion`, `accordion-item`, `accordion-trigger`, `accordion-content`

### Collapsible

- Source: shadcn-official (@shadcn/collapsible)
- Exports: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- Slots / parts: `collapsible`, `collapsible-trigger`, `collapsible-content`

## layout / structure primitives

### Card

- Source: shadcn-official (@shadcn/card)
- Exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent`
- Slots / parts: `card`, `card-header`, `card-title`, `card-description`, `card-action`, `card-content`, `card-footer`

### Resizable

- Source: shadcn-official (@shadcn/resizable)
- Exports: `ResizableHandle`, `ResizablePanel`, `ResizablePanelGroup`
- Slots / parts: `resizable-panel-group`, `resizable-panel`, `resizable-handle`

### Scroll Area

- Source: shadcn-official (@shadcn/scroll-area)
- Exports: `ScrollArea`, `ScrollBar`
- Slots / parts: `scroll-area`, `scroll-area-viewport`, `scroll-area-scrollbar`, `scroll-area-thumb`

### Separator

- Source: shadcn-official (@shadcn/separator)
- Exports: `Separator`
- Slots / parts: `separator`

## app shell

### Sidebar

- Source: shadcn-official (@shadcn/sidebar)
- Exports: `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInput`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar`
- Slots / parts: `sidebar-wrapper`, `sidebar`, `sidebar-gap`, `sidebar-container`, `sidebar-inner`, `sidebar-trigger`, `sidebar-rail`, `sidebar-inset`, `sidebar-input`, `sidebar-header`, `sidebar-footer`, `sidebar-separator`, `sidebar-content`, `sidebar-group`, `sidebar-group-label`, `sidebar-group-action`, `sidebar-group-content`, `sidebar-menu`, `sidebar-menu-item`, `sidebar-menu-button`, `sidebar-menu-action`, `sidebar-menu-badge`, `sidebar-menu-skeleton`, `sidebar-menu-sub`, `sidebar-menu-sub-item`, `sidebar-menu-sub-button`
- Variant props: `variant`: `default`, `outline`, `sidebar`, `floating`, `inset`; `size`: `default`, `sm`, `lg`, `md`; `side`: `left`, `right`; `collapsible`: `offcanvas`, `icon`, `none`

## status / feedback

### Progress

- Source: shadcn-official (@shadcn/progress)
- Exports: `Progress`
- Slots / parts: `progress`, `progress-indicator`

### Skeleton

- Source: shadcn-official (@shadcn/skeleton)
- Exports: `Skeleton`
- Slots / parts: `skeleton`

### Spinner

- Source: shadcn-official (@shadcn/spinner)
- Exports: `Spinner`

### Toast

- Source: shadcn-ecosystem (shadcn docs composition / legacy toast pattern)

### Sonner

- Source: shadcn-official (@shadcn/sonner)
- Exports: `Toaster`

### Empty

- Source: shadcn-official (@shadcn/empty)
- Exports: `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyMedia`
- Slots / parts: `empty`, `empty-header`, `empty-icon`, `empty-title`, `empty-description`, `empty-content`
- Variant props: `variant`: `default`, `icon`

## data display

### Table

- Source: shadcn-official (@shadcn/table)
- Exports: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`
- Slots / parts: `table-container`, `table`, `table-header`, `table-body`, `table-footer`, `table-row`, `table-head`, `table-cell`, `table-caption`

### Data Table

- Source: shadcn-ecosystem (shadcn docs composition (table + tanstack-table))

### Chart

- Source: shadcn-official (@shadcn/chart)
- Exports: `ChartConfig`, `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`
- Slots / parts: `chart`
- Variant props: `indicator`: `line`, `dot`, `dashed`

## sequence / media display

### Carousel

- Source: shadcn-official (@shadcn/carousel)
- Exports: `CarouselApi`, `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`
- Slots / parts: `carousel`, `carousel-content`, `carousel-item`, `carousel-previous`, `carousel-next`

## content tokens

### Avatar

- Source: shadcn-official (@shadcn/avatar)
- Exports: `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`
- Slots / parts: `avatar`, `avatar-image`, `avatar-fallback`, `avatar-badge`, `avatar-group`, `avatar-group-count`
- Variant props: `size`: `default`, `sm`, `lg`

### Badge

- Source: shadcn-official (@shadcn/badge)
- Exports: `Badge`, `badgeVariants`
- Slots / parts: `badge`
- Variant props: `variant`: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`

### Kbd

- Source: shadcn-official (@shadcn/kbd)
- Exports: `Kbd`, `KbdGroup`
- Slots / parts: `kbd`, `kbd-group`
