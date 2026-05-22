import { Badge } from "@/gallery/ui/badge"
import {
  Card,
  CardContent,
} from "@/gallery/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/gallery/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/gallery/ui/table"

const draftRows = [
  {
    assignee: "Sarah Chen",
    revision: "3",
    stage: "Ready",
    task: "Chart composition",
  },
  {
    assignee: "Marc Rodriguez",
    revision: "2",
    stage: "Review",
    task: "Table states",
  },
  {
    assignee: "Emily Watson",
    revision: "1",
    stage: "Draft",
    task: "Inset density",
  },
]

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

function getStageVariant(stage: string): BadgeVariant {
  if (stage === "Ready") {
    return "secondary"
  }

  if (stage === "Review") {
    return "outline"
  }

  if (stage === "Draft") {
    return "default"
  }

  return "destructive"
}

export function DraftStatusTableCard() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Revision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draftRows.map((row) => (
              <TableRow key={row.task}>
                <TableCell className="font-medium">{row.task}</TableCell>
                <TableCell>
                  <Select defaultValue={row.assignee}>
                    <SelectTrigger className="w-[calc(var(--space-4)*2.65)]" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                        <SelectItem value="Marc Rodriguez">Marc Rodriguez</SelectItem>
                        <SelectItem value="Emily Watson">Emily Watson</SelectItem>
                        <SelectItem value="David Kim">David Kim</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={getStageVariant(row.stage)}>{row.stage}</Badge>
                </TableCell>
                <TableCell className="text-right">{row.revision}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Visible rows</TableCell>
              <TableCell className="text-right">{draftRows.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
