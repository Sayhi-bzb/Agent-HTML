import { CodeBlock } from "../../components/code-block"
import { diffEvidenceTabs } from "./data/risk-map"
import { ReviewSectionHeader } from "./review-layout"

export default function DiffRiskMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="diff risk map"
        title="Changed lines show size. Heat shows consequence."
      />

      <CodeBlock tabs={diffEvidenceTabs} />
    </section>
  )
}
