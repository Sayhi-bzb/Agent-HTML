import { Badge } from "@/gallery/preview/ui/badge"
import { Separator } from "@/gallery/preview/ui/separator"
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
  TableRow,
} from "@/gallery/preview/ui/table"

export function SurfaceShowcaseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Surface stack</CardTitle>
        <CardDescription>
          Card, badge, separator, and compact table all consume preview primitives.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge>Preview only</Badge>
          <span className="text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
            Local primitive layer
          </span>
        </div>
        <Separator />
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="type-label">Primitive source</TableCell>
              <TableCell>gallery/preview/ui</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="type-label">Token source</TableCell>
              <TableCell>gallery/preview/styles</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
