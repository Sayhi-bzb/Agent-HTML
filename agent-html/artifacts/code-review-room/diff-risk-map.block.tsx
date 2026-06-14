import { CodeBlock } from "../../components/code-block"
import { diffEvidenceTabs } from "./data/risk-map"
import { ReviewSectionHeader } from "./review-layout"

export default function DiffRiskMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="diff risk map"
        title="Changed lines show size. Heat shows consequence."
      >
        This is the changed surface that starts the review. The code tab shows
        the diff, the trigger tab shows the shared state path, and the gates tab
        shows the package checks that must still agree.
      </ReviewSectionHeader>

      <CodeBlock tabs={diffEvidenceTabs} />
    </section>
  )
}
