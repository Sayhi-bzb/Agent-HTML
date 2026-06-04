import { useEffect, useMemo, useState } from "react"
import {
  Artifact,
  type ArtifactStateChangeInput,
  Block,
  useEmitArtifactStateChange,
} from "@agent-html/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"
import { Checkbox } from "../ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field"
import { Input } from "../ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp"
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar"
import { NativeSelect } from "../ui/native-select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable"
import { ScrollArea } from "../ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Slider } from "../ui/slider"
import { Switch } from "../ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"
import { Toggle } from "../ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

const promptDebugEventName = "agent-html:prompt-debug"
const blockId = "interaction-controls"
const comboboxOptions = [
  { label: "Design", value: "design" },
  { label: "Runtime", value: "runtime" },
  { label: "Host", value: "host" },
]

export type TextEditChangeInput = Pick<
  ArtifactStateChangeInput,
  "after" | "before" | "component" | "controlId" | "kind" | "semantic"
>

export function createTextEditChange({
  component,
  controlId,
  from,
  semantic,
  to,
}: {
  component: string
  controlId: "input" | "textarea"
  from: string
  semantic: string
  to: string
}): TextEditChangeInput | null {
  if (Object.is(from, to)) {
    return null
  }

  return {
    after: to,
    before: from,
    component,
    controlId,
    kind: "set",
    semantic,
  }
}

declare global {
  interface Window {
    __agentHtmlLastPrompt?: string
  }
}

export default function InteractionStateArtifact() {
  const emitChange = useEmitArtifactStateChange({ blockId })
  const [carouselApi, setCarouselApi] = useState<{
    off: (eventName: "select", callback: () => void) => void
    on: (eventName: "select", callback: () => void) => void
    selectedScrollSnap: () => number
  } | null>(null)
  const [state, setState] = useState({
    accordion: "forms",
    alertDialogOpen: false,
    calendar: new Date(2026, 5, 4),
    carouselSlide: 0,
    checkbox: false,
    collapsibleOpen: false,
    combobox: "design",
    commandAction: "none",
    contextAction: "none",
    dialogOpen: false,
    drawerOpen: false,
    dropdownAction: "none",
    input: "Canvas",
    menubarAction: "none",
    nativeSelect: "draft",
    otp: "",
    popoverOpen: false,
    radio: "agent",
    resizableLayout: "40/60",
    select: "review",
    sheetOpen: false,
    slider: 40,
    switch: false,
    tabs: "forms",
    textarea: "Try a short instruction.",
    toggle: false,
    toggleGroup: "compact",
  })
  const [textEditStart, setTextEditStart] = useState({
    input: state.input,
    textarea: state.textarea,
  })
  const dateLabel = useMemo(
    () => state.calendar.toISOString().slice(0, 10),
    [state.calendar]
  )

  useEffect(() => {
    const api = carouselApi

    if (!api) {
      return
    }

    function handleSelect() {
      record({
        component: "carousel",
        controlId: "carouselSlide",
        kind: "select",
        semantic: "select-carousel-slide",
        to: api!.selectedScrollSnap(),
      })
    }

    api.on("select", handleSelect)

    return () => {
      api.off("select", handleSelect)
    }
  }, [carouselApi, state.carouselSlide])

  function record<T>({
    component,
    controlId,
    kind,
    semantic,
    to,
  }: {
    component: string
    controlId: keyof typeof state
    kind: string
    semantic: string
    to: T
  }) {
    const before = state[controlId]

    emitChange({
      after: to,
      before,
      component,
      controlId,
      kind,
      semantic,
    })
    setState((current) => ({ ...current, [controlId]: to }))
  }

  function recordTextEdit({
    component,
    controlId,
    semantic,
    to,
  }: {
    component: string
    controlId: "input" | "textarea"
    semantic: string
    to: string
  }) {
    const change = createTextEditChange({
      component,
      controlId,
      from: textEditStart[controlId],
      semantic,
      to,
    })

    if (!change) {
      return
    }

    emitChange(change)
  }

  return (
    <Artifact title="Interaction State Example">
      <Block id="interaction-controls" title="Interaction Controls">
        <Card>
          <CardHeader>
            <CardTitle>Full interaction test bench</CardTitle>
            <CardDescription>
              Use these controls, then submit a block prompt to inspect the
              compact interaction diff.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-xl">
            <Tabs
              onValueChange={(value) =>
                record({
                  component: "tabs",
                  controlId: "tabs",
                  kind: "select",
                  semantic: "select-interaction-section",
                  to: value,
                })
              }
              value={state.tabs}
            >
              <TabsList>
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="overlays">Overlays</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="forms">
                <SectionCard description="Value, boolean, choice, date, and text state." title="Form controls">
                  <FieldSet>
                    <FieldLegend>Boolean controls</FieldLegend>
                    <FieldGroup>
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={state.checkbox}
                          id="capture-changes"
                          onCheckedChange={(value) =>
                            record({
                              component: "checkbox",
                              controlId: "checkbox",
                              kind: "toggle",
                              semantic: "toggle-checkbox",
                              to: value === true,
                            })
                          }
                        />
                        <FieldLabel htmlFor="capture-changes">
                          Checkbox
                        </FieldLabel>
                        <Badge variant="secondary">
                          {state.checkbox ? "checked" : "unchecked"}
                        </Badge>
                      </Field>
                      <Field orientation="horizontal">
                        <Switch
                          checked={state.switch}
                          id="interaction-switch"
                          onCheckedChange={(value) =>
                            record({
                              component: "switch",
                              controlId: "switch",
                              kind: "toggle",
                              semantic: "toggle-switch",
                              to: value,
                            })
                          }
                        />
                        <FieldLabel htmlFor="interaction-switch">
                          Switch
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <FieldGroup className="canvas-grid-gap grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="interaction-input">Input</FieldLabel>
                      <Input
                        id="interaction-input"
                        onBlur={(event) =>
                          recordTextEdit({
                            component: "input",
                            controlId: "input",
                            semantic: "set-input-text",
                            to: event.currentTarget.value,
                          })
                        }
                        onChange={(event) =>
                          setState((current) => ({
                            ...current,
                            input: event.currentTarget.value,
                          }))
                        }
                        onFocus={() =>
                          setTextEditStart((current) => ({
                            ...current,
                            input: state.input,
                          }))
                        }
                        value={state.input}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="interaction-textarea">
                        Textarea
                      </FieldLabel>
                      <Textarea
                        id="interaction-textarea"
                        onBlur={(event) =>
                          recordTextEdit({
                            component: "textarea",
                            controlId: "textarea",
                            semantic: "set-textarea-text",
                            to: event.currentTarget.value,
                          })
                        }
                        onChange={(event) =>
                          setState((current) => ({
                            ...current,
                            textarea: event.currentTarget.value,
                          }))
                        }
                        onFocus={() =>
                          setTextEditStart((current) => ({
                            ...current,
                            textarea: state.textarea,
                          }))
                        }
                        value={state.textarea}
                      />
                    </Field>
                  </FieldGroup>

                  <FieldGroup className="canvas-grid-gap grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel>Status select</FieldLabel>
                      <Select
                        onValueChange={(value) =>
                          record({
                            component: "select",
                            controlId: "select",
                            kind: "select",
                            semantic: "set-select-status",
                            to: value,
                          })
                        }
                        value={state.select}
                      >
                        <SelectTrigger aria-label="Status select">
                          <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="native-status">
                        Native select
                      </FieldLabel>
                      <NativeSelect
                        id="native-status"
                        onChange={(event) =>
                          record({
                            component: "native-select",
                            controlId: "nativeSelect",
                            kind: "select",
                            semantic: "set-native-select-status",
                            to: event.currentTarget.value,
                          })
                        }
                        value={state.nativeSelect}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="ready">Ready</option>
                      </NativeSelect>
                    </Field>
                  </FieldGroup>

                  <FieldSet>
                    <FieldLegend>Mode</FieldLegend>
                    <RadioGroup
                      onValueChange={(value) =>
                        record({
                          component: "radio-group",
                          controlId: "radio",
                          kind: "select",
                          semantic: "set-radio-mode",
                          to: value,
                        })
                      }
                      value={state.radio}
                    >
                      <RadioOption id="radio-agent" label="Agent" value="agent" />
                      <RadioOption id="radio-human" label="Human" value="human" />
                    </RadioGroup>
                  </FieldSet>

                  <Field>
                    <div className="canvas-cluster-md items-center justify-between">
                      <FieldLabel>Slider</FieldLabel>
                      <Badge variant="outline">{state.slider}%</Badge>
                    </div>
                    <Slider
                      max={100}
                      min={0}
                      onValueChange={(value) =>
                        setState((current) => ({
                          ...current,
                          slider: value[0] ?? current.slider,
                        }))
                      }
                      onValueCommit={(value) =>
                        record({
                          component: "slider",
                          controlId: "slider",
                          kind: "set",
                          semantic: "set-slider-threshold",
                          to: value[0] ?? state.slider,
                        })
                      }
                      step={5}
                      value={[state.slider]}
                    />
                  </Field>

                  <FieldGroup className="canvas-grid-gap grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel>Input OTP</FieldLabel>
                      <InputOTP
                        maxLength={6}
                        onChange={(value) =>
                          record({
                            component: "input-otp",
                            controlId: "otp",
                            kind: "set",
                            semantic: "set-otp-code",
                            to: value,
                          })
                        }
                        value={state.otp}
                      >
                        <InputOTPGroup>
                          {[0, 1, 2].map((index) => (
                            <InputOTPSlot index={index} key={index} />
                          ))}
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          {[3, 4, 5].map((index) => (
                            <InputOTPSlot index={index} key={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </Field>
                    <Field>
                      <div className="canvas-cluster-md items-center justify-between">
                        <FieldLabel>Calendar</FieldLabel>
                        <Badge variant="outline">{dateLabel}</Badge>
                      </div>
                      <Calendar
                        mode="single"
                        onSelect={(date) => {
                          if (date) {
                            record({
                              component: "calendar",
                              controlId: "calendar",
                              kind: "select",
                              semantic: "select-calendar-date",
                              to: date,
                            })
                          }
                        }}
                        selected={state.calendar}
                      />
                    </Field>
                  </FieldGroup>

                  <Field>
                    <FieldLabel>Combobox</FieldLabel>
                    <Combobox
                      itemToStringValue={(value) =>
                        comboboxOptions.find((option) => option.value === value)
                          ?.label ?? value
                      }
                      items={comboboxOptions.map((option) => option.value)}
                      onValueChange={(value) => {
                        if (typeof value !== "string") {
                          return
                        }

                        record({
                          component: "combobox",
                          controlId: "combobox",
                          kind: "select",
                          semantic: "select-combobox-option",
                          to: value,
                        })
                      }}
                      value={state.combobox}
                    >
                      <ComboboxInput placeholder="Select area" />
                      <ComboboxContent>
                        <ComboboxEmpty>No area found.</ComboboxEmpty>
                        <ComboboxList>
                          {(value) => {
                            const option = comboboxOptions.find(
                              (item) => item.value === value
                            )

                            return (
                              <ComboboxItem key={value} value={value}>
                                {option?.label ?? value}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                </SectionCard>
              </TabsContent>

              <TabsContent value="actions">
                <SectionCard description="Controls that produce action intent." title="Action controls">
                  <div className="canvas-wrap-sm">
                    <Toggle
                      onPressedChange={(value) =>
                        record({
                          component: "toggle",
                          controlId: "toggle",
                          kind: "toggle",
                          semantic: "toggle-single-button",
                          to: value,
                        })
                      }
                      pressed={state.toggle}
                    >
                      Toggle
                    </Toggle>
                    <ToggleGroup
                      onValueChange={(value) => {
                        if (value) {
                          record({
                            component: "toggle-group",
                            controlId: "toggleGroup",
                            kind: "select",
                            semantic: "set-toggle-group-mode",
                            to: value,
                          })
                        }
                      }}
                      type="single"
                      value={state.toggleGroup}
                    >
                      <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
                      <ToggleGroupItem value="expanded">Expanded</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <Command className="border">
                    <CommandInput placeholder="Run command..." />
                    <CommandList>
                      <CommandEmpty>No command found.</CommandEmpty>
                      <CommandGroup>
                        {["summarize", "rewrite", "validate"].map((action) => (
                          <CommandItem
                            key={action}
                            onSelect={() =>
                              record({
                                component: "command",
                                controlId: "commandAction",
                                kind: "action",
                                semantic: "run-command-action",
                                to: action,
                              })
                            }
                            value={action}
                          >
                            {action}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>

                  <div className="canvas-wrap-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline">
                          Dropdown
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onSelect={() =>
                              record({
                                component: "dropdown-menu",
                                controlId: "dropdownAction",
                                kind: "action",
                                semantic: "select-dropdown-action",
                                to: "copy",
                              })
                            }
                          >
                            Copy
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <Button type="button" variant="outline">
                          Context area
                        </Button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuGroup>
                          <ContextMenuItem
                            onSelect={() =>
                              record({
                                component: "context-menu",
                                controlId: "contextAction",
                                kind: "action",
                                semantic: "select-context-action",
                                to: "inspect",
                              })
                            }
                          >
                            Inspect
                          </ContextMenuItem>
                        </ContextMenuGroup>
                      </ContextMenuContent>
                    </ContextMenu>

                    <Menubar>
                      <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                          <MenubarGroup>
                            <MenubarItem
                              onSelect={() =>
                                record({
                                  component: "menubar",
                                  controlId: "menubarAction",
                                  kind: "action",
                                  semantic: "select-menubar-action",
                                  to: "export",
                                })
                              }
                            >
                              Export
                            </MenubarItem>
                          </MenubarGroup>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  </div>
                </SectionCard>
              </TabsContent>

              <TabsContent value="overlays">
                <SectionCard description="Open state is captured for every overlay." title="Overlay controls">
                  <div className="canvas-wrap-sm">
                    <Dialog
                      onOpenChange={(value) =>
                        record({
                          component: "dialog",
                          controlId: "dialogOpen",
                          kind: "open",
                          semantic: "set-dialog-open",
                          to: value,
                        })
                      }
                      open={state.dialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dialog</DialogTitle>
                          <DialogDescription>Dialog open state is tracked.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter showCloseButton />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog
                      onOpenChange={(value) =>
                        record({
                          component: "alert-dialog",
                          controlId: "alertDialogOpen",
                          kind: "open",
                          semantic: "set-alert-dialog-open",
                          to: value,
                        })
                      }
                      open={state.alertDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline">Alert</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm action</AlertDialogTitle>
                          <AlertDialogDescription>
                            This alert dialog tracks open state.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Sheet
                      onOpenChange={(value) =>
                        record({
                          component: "sheet",
                          controlId: "sheetOpen",
                          kind: "open",
                          semantic: "set-sheet-open",
                          to: value,
                        })
                      }
                      open={state.sheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button type="button" variant="outline">Sheet</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Sheet</SheetTitle>
                          <SheetDescription>Sheet state is tracked.</SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>

                    <Drawer
                      onOpenChange={(value) =>
                        record({
                          component: "drawer",
                          controlId: "drawerOpen",
                          kind: "open",
                          semantic: "set-drawer-open",
                          to: value,
                        })
                      }
                      open={state.drawerOpen}
                    >
                      <DrawerTrigger asChild>
                        <Button type="button" variant="outline">Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Drawer</DrawerTitle>
                          <DrawerDescription>Drawer state is tracked.</DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter />
                      </DrawerContent>
                    </Drawer>

                    <Popover
                      onOpenChange={(value) =>
                        record({
                          component: "popover",
                          controlId: "popoverOpen",
                          kind: "open",
                          semantic: "set-popover-open",
                          to: value,
                        })
                      }
                      open={state.popoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline">Popover</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <p className="canvas-text-body text-muted-foreground">
                          Popover state is tracked.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Accordion
                    onValueChange={(value) =>
                      record({
                        component: "accordion",
                        controlId: "accordion",
                        kind: "open",
                        semantic: "set-accordion-section",
                        to: value,
                      })
                    }
                    type="single"
                    value={state.accordion}
                  >
                    <AccordionItem value="forms">
                      <AccordionTrigger>Accordion trigger</AccordionTrigger>
                      <AccordionContent>Accordion state is tracked.</AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Collapsible
                    onOpenChange={(value) =>
                      record({
                        component: "collapsible",
                        controlId: "collapsibleOpen",
                        kind: "open",
                        semantic: "set-collapsible-open",
                        to: value,
                      })
                    }
                    open={state.collapsibleOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline">Collapsible</Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="canvas-content-panel">
                        <p className="canvas-text-body text-muted-foreground">
                          Collapsible open state is tracked.
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </SectionCard>
              </TabsContent>

              <TabsContent value="layout">
                <SectionCard description="Layout and carousel state produce compact diffs." title="Layout controls">
                  <div className="h-32 rounded-lg border">
                    <ResizablePanelGroup
                      onLayoutChange={(layout: Record<string, number>) =>
                        record({
                          component: "resizable",
                          controlId: "resizableLayout",
                          kind: "resize",
                          semantic: "set-resizable-layout",
                          to: Object.values(layout).map(Math.round).join("/"),
                        })
                      }
                      orientation="horizontal"
                    >
                      <ResizablePanel defaultSize={40}>
                        <div className="flex h-full items-center justify-center p-4">
                          Left
                        </div>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={60}>
                        <div className="flex h-full items-center justify-center p-4">
                          Right
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>

                  <Carousel
                    className="px-12"
                    setApi={(api) => setCarouselApi(api ?? null)}
                  >
                    <CarouselContent>
                      {[0, 1, 2].map((item) => (
                        <CarouselItem key={item}>
                          <div className="canvas-content-panel text-center">
                            Slide {item + 1}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </SectionCard>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Block>

      <Block id="prompt-display" title="Prompt Display">
        <PromptDisplay />
      </Block>
    </Artifact>
  )
}

function SectionCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="canvas-stack-lg">{children}</CardContent>
    </Card>
  )
}

function RadioOption({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: string
}) {
  return (
    <Field orientation="horizontal">
      <RadioGroupItem id={id} value={value} />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </Field>
  )
}

function PromptDisplay() {
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    setPrompt(window.__agentHtmlLastPrompt ?? "")

    function handlePromptDebug(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return
      }

      const detail = event.detail as { prompt?: unknown }

      if (typeof detail.prompt === "string") {
        setPrompt(detail.prompt)
      }
    }

    window.addEventListener(promptDebugEventName, handlePromptDebug)

    return () => {
      window.removeEventListener(promptDebugEventName, handlePromptDebug)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt display</CardTitle>
        <CardDescription>
          Submit a block prompt to preview the generated request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 rounded-lg border bg-muted/30">
          {prompt ? (
            <pre className="whitespace-pre-wrap p-4 text-sm">{prompt}</pre>
          ) : (
            <div className="p-4">
              <p className="canvas-text-body text-muted-foreground">
                No generated prompt yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
