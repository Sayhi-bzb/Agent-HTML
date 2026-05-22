import { Button } from "@/gallery/ui/button"
import {
  Card,
  CardContent,
} from "@/gallery/ui/card"
import { Input } from "@/gallery/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/gallery/ui/table"

const budgetRows = [
  {
    amount: "$29.99",
    item: "Card spacing",
    quantity: "1",
  },
  {
    amount: "$129.99",
    item: "Chart clarity",
    quantity: "2",
  },
  {
    amount: "$49.99",
    item: "Table polish",
    quantity: "1",
  },
]

export function BudgetTableCard() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetRows.map((row) => (
              <TableRow key={row.item}>
                <TableCell className="font-medium">{row.item}</TableCell>
                <TableCell>
                  <Input
                    className="w-[calc(var(--space-4)*1.35)]"
                    defaultValue={row.quantity}
                    min="0"
                    type="number"
                  />
                </TableCell>
                <TableCell>{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className="flex justify-end pt-0">
        <Button size="sm" type="button" variant="outline">
          Review
        </Button>
      </CardContent>
    </Card>
  )
}
