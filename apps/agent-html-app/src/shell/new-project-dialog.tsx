import * as React from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/app/shared/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/shared/ui/dialog"
import { Input } from "@/app/shared/ui/input"
import { Label } from "@/app/shared/ui/label"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"

export function NewProjectDialog({
  canCreate,
  onCreateProject,
}: {
  canCreate: boolean
  onCreateProject: (input: { name: string }) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const nextName = name.trim()

      if (!nextName) {
        setError("Project name is required.")
        return
      }

      setIsSubmitting(true)
      setError(null)
      onCreateProject({ name: nextName })
        .then(() => {
          setName("")
          setOpen(false)
        })
        .catch((nextError: unknown) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Unable to create project."
          )
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [name, onCreateProject]
  )

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            disabled={!canCreate}
            onClick={() => setOpen(true)}
            title={canCreate ? undefined : "Desktop runtime required"}
            type="button"
          >
            <PlusIcon />
            <span>New Project</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
              <DialogDescription>
                Create an AgentHTML workspace project with a blank overview
                section.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <Label htmlFor="new-project-name">Name</Label>
              <Input
                autoFocus
                disabled={isSubmitting}
                id="new-project-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Research Notes"
                value={name}
              />
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={isSubmitting} type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
