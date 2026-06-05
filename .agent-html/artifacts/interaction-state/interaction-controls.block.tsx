import { useState } from "react"
import { useEmitArtifactStateChange } from "@agent-html/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion"
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
} from "../../ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Checkbox } from "../../ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../../ui/field"
import { Input } from "../../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Progress } from "../../ui/progress"
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet"
import { Skeleton } from "../../ui/skeleton"
import { Slider } from "../../ui/slider"
import { Switch } from "../../ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Textarea } from "../../ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"

import { createTextEditChange } from "./state-change"

const blockId = "interaction-controls"

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

export function InteractionControlsBlock() {
  const emitChange = useEmitArtifactStateChange({ blockId })
  const [state, setState] = useState({
    accordion: "summary",
    alertDialogOpen: false,
    checkbox: false,
    collapsibleOpen: false,
    dialogOpen: false,
    input: "Canvas",
    mode: "compact",
    popoverOpen: false,
    progress: 55,
    radio: "agent",
    select: "review",
    sheetOpen: false,
    slider: 40,
    switch: false,
    tabs: "overview",
    textarea: "Try a short instruction.",
  })
  const [textEditStart, setTextEditStart] = useState({
    input: state.input,
    textarea: state.textarea,
  })

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

    if (change) {
      emitChange(change)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaction patterns</CardTitle>
        <CardDescription>
          A compact example of default UI choices and instrumented state
          changes.
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="disclosure">Disclosure</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SectionCard
              description="Start with visible content and semantic status before using heavier interaction."
              title="Start here"
            >
              <Alert>
                <AlertTitle>Default path</AlertTitle>
                <AlertDescription>
                  Use cards, badges, alerts, tables, tabs, separators, and
                  progress states before reaching for specialized components.
                </AlertDescription>
              </Alert>

              <div className="canvas-grid-gap md:grid-cols-3">
                <div className="canvas-content-panel-sm canvas-stack-sm">
                  <Badge>Review</Badge>
                  <p className="canvas-text-body text-muted-foreground">
                    Badge for read-only state.
                  </p>
                </div>
                <div className="canvas-content-panel-sm canvas-stack-sm">
                  <p className="canvas-text-body">Known progress</p>
                  <Progress value={state.progress} />
                </div>
                <div className="canvas-content-panel-sm canvas-stack-sm">
                  <p className="canvas-text-body">Loading placeholder</p>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              <div className="canvas-wrap-sm">
                <Button
                  onClick={() =>
                    record({
                      component: "button",
                      controlId: "progress",
                      kind: "set",
                      semantic: "advance-progress",
                      to: Math.min(state.progress + 10, 100),
                    })
                  }
                  type="button"
                >
                  Advance
                </Button>
                <Button
                  onClick={() =>
                    record({
                      component: "button",
                      controlId: "progress",
                      kind: "set",
                      semantic: "reset-progress",
                      to: 55,
                    })
                  }
                  type="button"
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="input">
            <SectionCard
              description="Choose form controls by the kind of value users provide."
              title="Collect input"
            >
              <FieldGroup className="canvas-grid-gap md:grid-cols-2">
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

              <FieldGroup className="canvas-grid-gap md:grid-cols-2">
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
                  <FieldLabel>Mode switch</FieldLabel>
                  <ToggleGroup
                    onValueChange={(value) => {
                      if (value) {
                        record({
                          component: "toggle-group",
                          controlId: "mode",
                          kind: "select",
                          semantic: "set-display-mode",
                          to: value,
                        })
                      }
                    }}
                    type="single"
                    value={state.mode}
                  >
                    <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
                    <ToggleGroupItem value="expanded">Expanded</ToggleGroupItem>
                  </ToggleGroup>
                </Field>
              </FieldGroup>

              <FieldSet>
                <FieldLegend>Choice and boolean values</FieldLegend>
                <FieldGroup className="canvas-grid-gap md:grid-cols-2">
                  <Field>
                    <FieldLabel>Semantic single choice</FieldLabel>
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
                      <RadioOption
                        id="radio-agent"
                        label="Agent"
                        value="agent"
                      />
                      <RadioOption
                        id="radio-human"
                        label="Human"
                        value="human"
                      />
                    </RadioGroup>
                  </Field>
                  <div className="canvas-stack-md">
                    <Field orientation="horizontal">
                      <Checkbox
                        checked={state.checkbox}
                        id="capture-changes"
                        onCheckedChange={(value) =>
                          record({
                            component: "checkbox",
                            controlId: "checkbox",
                            kind: "toggle",
                            semantic: "toggle-form-checkbox",
                            to: value === true,
                          })
                        }
                      />
                      <FieldLabel htmlFor="capture-changes">
                        Form checkbox
                      </FieldLabel>
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
                            semantic: "toggle-immediate-setting",
                            to: value,
                          })
                        }
                      />
                      <FieldLabel htmlFor="interaction-switch">
                        Immediate setting
                      </FieldLabel>
                    </Field>
                  </div>
                </FieldGroup>
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
            </SectionCard>
          </TabsContent>

          <TabsContent value="disclosure">
            <SectionCard
              description="Hide or overlay content only when it makes the main path cheaper."
              title="Reveal or overlay"
            >
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
                <AccordionItem value="summary">
                  <AccordionTrigger>Optional implementation notes</AccordionTrigger>
                  <AccordionContent>
                    Use accordions for supporting detail, not content users
                    must compare to complete the task.
                  </AccordionContent>
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
                  <Button type="button" variant="outline">
                    Advanced controls
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="canvas-content-panel">
                    <p className="canvas-text-body text-muted-foreground">
                      Collapsible content is local and optional.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

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
                    <Button type="button" variant="outline">
                      Focused task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Focused task</DialogTitle>
                      <DialogDescription>
                        Use Dialog for a task that needs modal focus.
                      </DialogDescription>
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
                    <Button type="button" variant="outline">
                      Confirm
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm action</AlertDialogTitle>
                      <AlertDialogDescription>
                        Use AlertDialog for destructive or irreversible
                        confirmation.
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
                    <Button type="button" variant="outline">
                      Side task
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Side task</SheetTitle>
                      <SheetDescription>
                        Use Sheet when work should preserve the page context.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>

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
                    <Button type="button" variant="outline">
                      Context
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="canvas-text-body text-muted-foreground">
                      Use Popover for richer contextual detail.
                    </p>
                  </PopoverContent>
                </Popover>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost">
                        Tooltip
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Short helper text only.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
