import { Badge } from "@/gallery/preview/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
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
  { name: "Northstar brief", status: "Approved", owner: "Ava" },
  { name: "Gallery notes", status: "Draft", owner: "Leo" },
  { name: "Metric story", status: "Review", owner: "Rin" },
] as const

export function DraftStatusTableCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft status</CardTitle>
        <CardDescription>Table density inside a lightweight card shell.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Document</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="type-label pl-4">{row.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
                <TableCell>{row.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
