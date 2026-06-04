import * as React from "react"
import {
  MessageSquareIcon,
  PanelRightCloseIcon,
  SendIcon,
} from "lucide-react"

import { Button } from "#agent-html-playground/ui/button"
import { Input } from "#agent-html-playground/ui/input"
import { ScrollArea } from "#agent-html-playground/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#agent-html-playground/ui/sidebar"
import type { PromptTarget } from "./host-contracts"

export function PromptPanel({
  activeFilePath,
  onClose,
  onSubmit,
  output,
  status,
  target,
}: {
  activeFilePath: string | null
  onClose: () => void
  onSubmit: (request: string) => void
  output: string
  status: string
  target: PromptTarget | null
}) {
  const [draft, setDraft] = React.useState(target?.initialRequest ?? "")

  React.useEffect(() => {
    setDraft(target?.initialRequest ?? "")
  }, [target])

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas" side="right">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" type="button">
              <MessageSquareIcon />
              <span className="min-w-0 truncate text-sm font-medium">
                AI Conversation
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Target</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col gap-1 px-2 text-sm">
              <p className="truncate font-medium">
                {target?.title ?? "No block selected"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {activeFilePath ?? "No active artifact"}
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Prompt</SidebarGroupLabel>
          <SidebarGroupContent>
            <form
              className="flex gap-2 px-2"
              onSubmit={(event) => {
                event.preventDefault()
                const request = draft.trim()
                if (request && target) {
                  onSubmit(request)
                }
              }}
            >
              <Input
                disabled={!target}
                onChange={(event) => setDraft(event.currentTarget.value)}
                placeholder="Ask the agent to update this block..."
                value={draft}
              />
              <Button
                disabled={!target || !draft.trim()}
                size="icon"
                type="submit"
              >
                <SendIcon data-icon="inline-start" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </SidebarGroupContent>
        </SidebarGroup>
        {status ? (
          <SidebarGroup>
            <SidebarGroupLabel>Status</SidebarGroupLabel>
            <SidebarGroupContent>
              <p className="px-2 text-xs text-sidebar-foreground/70">
                {status}
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {output ? (
          <SidebarGroup>
            <SidebarGroupLabel>Generated Prompt</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="mx-2 h-80 rounded-md bg-sidebar-accent">
                <pre className="p-3 text-xs text-sidebar-accent-foreground">
                  {output}
                </pre>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Button
          disabled={!target}
          onClick={onClose}
          type="button"
          variant="outline"
        >
          <PanelRightCloseIcon data-icon="inline-start" />
          Clear target
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
