import { Badge } from "@/gallery/preview/ui/badge"
import { Progress } from "@/gallery/preview/ui/progress"
import { Separator } from "@/gallery/preview/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/gallery/preview/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/gallery/preview/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"

export function FieldShowcaseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field stack</CardTitle>
        <CardDescription>
          Labels, helper text, alerts, and disclosure rhythm.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[length:var(--type-sm)] leading-[var(--type-base-line-height)] font-medium">
            Component notes
          </label>
          <p className="text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
            Preview-only tokens should not leak into editor shell text.
          </p>
        </div>
        <Alert>
          <AlertTitle>Preview boundary</AlertTitle>
          <AlertDescription>
            Gallery showcase content consumes preview primitives, not shell primitives.
          </AlertDescription>
        </Alert>
        <Progress value={58} />
        <Separator />
        <Accordion type="single" collapsible>
          <AccordionItem value="scope">
            <AccordionTrigger>Scope notes</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Rule</Badge>
                <span>Preview cards stay inside the preview subtree.</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
