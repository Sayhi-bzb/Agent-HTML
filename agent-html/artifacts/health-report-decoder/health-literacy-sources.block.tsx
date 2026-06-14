import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { SourceLinks } from "../../components/source-links"

import { sourceGroups } from "./data/sources"

export default function HealthLiteracySourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">健康阅读资料</Badge>
        <h2 className="canvas-text-heading">
          参考资料放在最后。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          页面里的阅读方式参考了公开健康信息材料；外部标题保留原文，方便回查。
        </p>
      </div>

      <div className="canvas-grid-2">
        {sourceGroups.map((group) => (
          <div className="canvas-stack-xs" key={group.label}>
            <Badge variant="outline">{group.label}</Badge>
            <SourceLinks links={group.links} />
          </div>
        ))}
      </div>

      <Alert>
        <AlertDescription>
          这些资料只支持阅读方式。个人判断仍以原始报告、既往病史和医生沟通为准。
        </AlertDescription>
      </Alert>
    </section>
  )
}
