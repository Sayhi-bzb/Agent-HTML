import { Badge } from "@/gallery/preview/ui/badge"
import { Progress } from "@/gallery/preview/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/gallery/preview/ui/table"

const rows = [
  { item: "User research", owner: "Mia", progress: 82, status: "On track" },
  { item: "Prototype polish", owner: "Jun", progress: 61, status: "Review" },
  { item: "Handoff notes", owner: "Rae", progress: 44, status: "Draft" },
] as const

export function BudgetTableCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget checkpoints</CardTitle>
        <CardDescription>
          Compact table rhythm with badge and progress primitives.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Workstream</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.item}>
                <TableCell className="pl-4">
                  <div className="flex flex-col gap-1">
                    <span className="type-label">{row.item}</span>
                    <Progress value={row.progress} />
                  </div>
                </TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between">
        <span>Spend pacing is balanced across three active tracks.</span>
        <span>Q3 review</span>
      </CardFooter>
    </Card>
  )
}
