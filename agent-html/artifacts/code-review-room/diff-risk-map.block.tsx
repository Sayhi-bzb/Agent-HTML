import { CodeBlock } from "../../components/code-block"
import { selectedDiff } from "./data/risk-map"
import { ReviewSectionHeader } from "./review-layout"

export default function DiffRiskMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="diff risk map"
        title="Changed lines show size. Heat shows consequence."
      />

      <CodeBlock
        caption="Selected candidate: the file is not the largest surface, but sorting, filtering, pagination, search, and row behavior converge here."
        code={selectedDiff}
        language="diff"
        title="selected-candidate.diff"
      />
    </section>
  )
}
