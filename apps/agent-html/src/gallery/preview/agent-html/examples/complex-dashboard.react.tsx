import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/gallery/preview/ui/accordion"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/gallery/preview/ui/alert"
import { Badge } from "@/gallery/preview/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"
import { Progress } from "@/gallery/preview/ui/progress"
import { Separator } from "@/gallery/preview/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/gallery/preview/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/gallery/preview/ui/tabs"

export function ComplexDashboardExample() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">Synced 12m ago</Badge>
        <Badge variant="outline">4 teams active</Badge>
        <Badge variant="destructive">2 incidents open</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Release status</CardTitle>
            <CardDescription>
              Track the path from review to production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="publish">
              <TabsList>
                <TabsTrigger value="publish">Publish</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="archive">Archive</TabsTrigger>
              </TabsList>

              <TabsContent value="publish">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">82%</Badge>
                    <Badge variant="outline">Ready for cutover</Badge>
                  </div>
                  <Progress value={82} />
                  <Alert>
                    <AlertTitle>Release window confirmed</AlertTitle>
                    <AlertDescription>
                      The production train is aligned for 19:00 UTC.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="review">
                <div className="flex flex-col gap-2">
                  <Badge variant="outline">5 approvals remaining</Badge>
                  <Progress value={64} />
                  <Alert>
                    <AlertTitle>Design review open</AlertTitle>
                    <AlertDescription>
                      Density and footer alignment still need sign-off.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="archive">
                <div className="flex flex-col gap-2">
                  <Badge variant="destructive">Paused</Badge>
                  <Progress value={28} />
                  <Alert variant="destructive">
                    <AlertTitle>Archive blocked</AlertTitle>
                    <AlertDescription>
                      Dependency snapshot failed on two legacy modules.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Primary lane</Badge>
              <Badge variant="outline">Token-driven</Badge>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review notes</CardTitle>
            <CardDescription>
              Surface nested sections and state transitions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single">
              <AccordionItem value="layout">
                <AccordionTrigger>Layout continuity</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <Alert>
                      <AlertTitle>Shell alignment</AlertTitle>
                      <AlertDescription>
                        Inset spacing now matches the active gallery workspace rhythm.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Aligned</Badge>
                      <Badge variant="outline">Spacing</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tokens">
                <AccordionTrigger>Token migration</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <Alert>
                      <AlertTitle>Color map stable</AlertTitle>
                      <AlertDescription>
                        Primary, muted, and border tokens now match the preview runtime.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Stable</Badge>
                      <Badge variant="outline">Preview</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Team readiness</CardTitle>
            <CardDescription>
              Operational table with summary footer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Current release support matrix</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Design systems</TableCell>
                  <TableCell>Ready</TableCell>
                  <TableCell>Sarah Chen</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Platform runtime</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell>Marc Rodriguez</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Content ops</TableCell>
                  <TableCell>Draft</TableCell>
                  <TableCell>Emily Watson</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Visible teams</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>2 active leads</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision summary</CardTitle>
            <CardDescription>
              Compact recap of what changes next.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">Overview</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Alert>
                <AlertTitle>Next checkpoint</AlertTitle>
                <AlertDescription>
                  Move chart and carousel into the second render batch after
                  layout runtime settles.
                </AlertDescription>
              </Alert>
              <Separator />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Render v0</Badge>
                <Badge variant="outline">Independent route</Badge>
                <Badge variant="outline">Preview UI runtime</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
