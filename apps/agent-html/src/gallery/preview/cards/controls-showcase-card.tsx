import { Badge } from "@/gallery/preview/ui/badge"
import { Progress } from "@/gallery/preview/ui/progress"
import { Separator } from "@/gallery/preview/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/gallery/preview/ui/tabs"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"

export function ControlsShowcaseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Control stack</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="ship">Ship</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="review" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span>Review confidence</span>
              <Badge>Ready</Badge>
            </div>
            <Progress value={72} />
          </TabsContent>
          <TabsContent value="ship" className="text-muted-foreground">
            Release preparation view.
          </TabsContent>
          <TabsContent value="notes" className="text-muted-foreground">
            Supporting annotations and checklist context.
          </TabsContent>
        </Tabs>
        <Separator />
      </CardContent>
      <CardFooter className="justify-between gap-3 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
        <span>Tabs, badges, separators, and progress unify under preview tokens.</span>
        <span>Controls study</span>
      </CardFooter>
    </Card>
  )
}
