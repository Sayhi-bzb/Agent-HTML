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
import { Cell, Pie, PieChart } from "recharts"

const data = [
  { name: "Docs", value: 42, fill: "var(--chart-1)" },
  { name: "Shell", value: 31, fill: "var(--chart-2)" },
  { name: "Preview", value: 27, fill: "var(--chart-4)" },
] as const

const chartConfig = {
  value: {
    color: "var(--chart-1)",
    label: "Share",
  },
} satisfies ChartConfig

export function SourceShareCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source share</CardTitle>
        <CardDescription>Pie chart and supporting metadata inside preview UI.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-52 max-w-52">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-[length:var(--type-sm)] leading-[var(--type-base-line-height)]">
        <div className="type-label flex gap-2 leading-[calc(var(--type-base-line-height)*0.92)]">
          <span>Balanced preview composition</span>
        </div>
        <div className="text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
          Typography and charts both stay under the preview token boundary.
        </div>
      </CardFooter>
    </Card>
  )
}
