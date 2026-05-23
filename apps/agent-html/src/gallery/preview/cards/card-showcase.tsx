import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"
import { ShowcaseShell } from "@/gallery/preview/cards/showcase-shell"

export function CardShowcase() {
  return (
    <ShowcaseShell
      title="Card"
      description="The card family defines the internal shell for grouped content, action, and footer rhythm."
      bodyClassName="grid gap-4"
      footer="Both default and small sizes are visible here so the card API is showcased by its own family."
    >
      <Card>
        <CardHeader>
          <CardTitle>Release narrative</CardTitle>
          <CardDescription>
            Default size keeps room for title, supporting text, and a trailing action.
          </CardDescription>
          <CardAction>
            <button
              className="type-control rounded-md border border-border px-2 py-1 transition-colors hover:bg-muted"
              type="button"
            >
              Open
            </button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <p className="type-body text-foreground/90">
              The content slot should feel like a clear reading lane rather than a generic div with padding.
            </p>
            <p className="type-supporting text-muted-foreground">
              Header, content, and footer spacing remain distinct without extra utility wrappers.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <span>Owner: Design systems</span>
          <span>Stage: Review</span>
        </CardFooter>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Small card variant</CardTitle>
          <CardDescription>
            Compact cards are useful when density matters more than long-form reading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="type-supporting text-muted-foreground">
            This variant compresses spacing without collapsing the internal slot model.
          </p>
        </CardContent>
      </Card>
    </ShowcaseShell>
  )
}
