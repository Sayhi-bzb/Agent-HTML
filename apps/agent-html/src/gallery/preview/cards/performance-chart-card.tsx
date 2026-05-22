import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/gallery/preview/ui/chart"
import type { ChartConfig } from "@/gallery/preview/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const data = [
  { month: "Jan", output: 24 },
  { month: "Feb", output: 31 },
  { month: "Mar", output: 28 },
  { month: "Apr", output: 37 },
] as const

const chartConfig = {
  output: {
    color: "var(--chart-3)",
    label: "Output",
  },
} satisfies ChartConfig

export function PerformanceChartCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
        <CardDescription>Chart token consumption inside the preview lane.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="output" radius={8} fill="var(--color-output)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex w-full items-start gap-2 text-[length:var(--type-sm)] leading-[var(--type-base-line-height)]">
        <div className="flex flex-col gap-1">
          <div className="type-label flex items-center gap-2 leading-[calc(var(--type-base-line-height)*0.92)]">
            Trend continues upward
          </div>
          <div className="flex items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
            Preview charts consume local card typography scale.
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
