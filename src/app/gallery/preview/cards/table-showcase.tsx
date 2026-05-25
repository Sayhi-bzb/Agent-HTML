import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/table"
import { ShowcaseShell } from "@/app/gallery/preview/cards/showcase-shell"

const rows = [
  { owner: "Mia", stage: "Audit", hours: "06h" },
  { owner: "Jun", stage: "Rewrite", hours: "09h" },
  { owner: "Rae", stage: "Proof", hours: "04h" },
] as const

export function TableShowcase() {
  return (
    <ShowcaseShell
      title="Table"
      description="Structured comparison for dense rows, headers, captions, and summary totals."
      footer="The footer and caption are visible here so the table family is showcased as more than a bare grid."
    >
      <Table>
        <TableCaption>Three active workstreams in the current review cycle.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-0">Owner</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.owner}>
              <TableCell className="pl-0 type-label">{row.owner}</TableCell>
              <TableCell>{row.stage}</TableCell>
              <TableCell className="text-right font-mono">{row.hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="pl-0">Total</TableCell>
            <TableCell>Cycle effort</TableCell>
            <TableCell className="text-right font-mono">19h</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </ShowcaseShell>
  )
}

