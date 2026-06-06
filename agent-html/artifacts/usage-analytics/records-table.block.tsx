import { MousePointerClickIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import { formatCurrency, formatNumber, formatSeconds } from "./data"

type RecordsTableBlockProps = {
  requestThreshold: number
  selectedRow: UsageDashboardRow | null
  setSelectedRowKey: (key: string) => void
  visibleRows: UsageDashboardRow[]
}

export function RecordsTableBlock({
  requestThreshold,
  selectedRow,
  setSelectedRowKey,
  visibleRows,
}: RecordsTableBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">
            <MousePointerClickIcon data-icon="inline-start" />
            selectable
          </Badge>
          <Badge variant="outline">threshold {formatNumber(requestThreshold)}</Badge>
        </div>
        <h2 className="canvas-text-heading">Records table</h2>
        <p className="canvas-text-body text-muted-foreground">
          Select a row to update the inspector. Rows above threshold are marked
          without changing the source dataset.
        </p>
      </div>

      <ScrollArea className="h-96 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hour</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => {
              const isSelected = selectedRow?.bucketStart === row.bucketStart
              const isAboveThreshold = row.requests >= requestThreshold

              return (
                <TableRow
                  data-state={isSelected ? "selected" : undefined}
                  key={row.bucketStart}
                >
                  <TableCell>
                    <Button
                      onClick={() => setSelectedRowKey(row.bucketStart)}
                      type="button"
                      variant="ghost"
                    >
                      {row.hour}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="canvas-wrap-sm items-center">
                      {formatNumber(row.requests)}
                      {isAboveThreshold ? (
                        <Badge variant="secondary">
                          <TrendingUpIcon data-icon="inline-start" />
                          high
                        </Badge>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>{formatNumber(row.users)}</TableCell>
                  <TableCell>{formatNumber(row.tokens)}</TableCell>
                  <TableCell>{formatSeconds(row.durationSeconds)}</TableCell>
                  <TableCell>{formatCurrency(row.cost)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </section>
  )
}
