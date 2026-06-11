import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

import { lifeContextFields } from "./data"

const lifeContextIconByLabel: Record<string, { label: string; src: string }> = {
  家庭病史: {
    label: "病史记录图标",
    src: "/__agent-html/public/health-report-decoder/healthicons/medical-records.svg",
  },
  近期感染: {
    label: "发热感染图标",
    src: "/__agent-html/public/health-report-decoder/healthicons/fever.svg",
  },
  睡眠与压力: {
    label: "心理压力图标",
    src: "/__agent-html/public/health-report-decoder/healthicons/psychology.svg",
  },
  用药与补充剂: {
    label: "用药图标",
    src: "/__agent-html/public/health-report-decoder/healthicons/medicine-bottle.svg",
  },
  运动: {
    label: "运动图标",
    src: "/__agent-html/public/health-report-decoder/healthicons/gym.svg",
  },
  饮食与饮酒: {
    label: "饮食图标",
    src: "/__agent-html/public/health-report-decoder/healthicons/i-utensils.svg",
  },
}

function LifeContextIcon({ fieldLabel }: { fieldLabel: string }) {
  const icon = lifeContextIconByLabel[fieldLabel]

  if (!icon) {
    return null
  }

  return (
    <span
      aria-label={icon.label}
      className="size-6 shrink-0 bg-current text-muted-foreground [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
      role="img"
      style={{
        WebkitMaskImage: `url(${icon.src})`,
        maskImage: `url(${icon.src})`,
      }}
    />
  )
}

export function RecentLifeContextBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">近期生活背景</Badge>
        <h2 className="canvas-text-heading">
          复查前，先把最近两周写下来。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          睡眠、饮食、运动、用药这些信息不负责解释结果，但能让下一次沟通少一点遗漏。
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>字段</TableHead>
              <TableHead>问题</TableHead>
              <TableHead>记录内容</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lifeContextFields.map((field) => (
              <TableRow key={field.label}>
                <TableCell className="font-medium">
                  <span className="canvas-wrap-sm items-center">
                    <LifeContextIcon fieldLabel={field.label} />
                    {field.label}
                  </span>
                </TableCell>
                <TableCell>{field.prompt}</TableCell>
                <TableCell>{field.record}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Alert>
        <AlertDescription>
          示例数值均为虚构；真实记录请按原始报告和医生建议处理。
        </AlertDescription>
      </Alert>
    </section>
  )
}
