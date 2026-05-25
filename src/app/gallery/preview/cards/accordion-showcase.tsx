import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/shared/ui/accordion"
import { ShowcaseShell } from "@/app/gallery/preview/cards/showcase-shell"

const items = [
  {
    title: "Why a single-expand accordion?",
    body: "It keeps long-form review notes readable without turning the preview lane into a wall of text.",
  },
  {
    title: "What should the trigger carry?",
    body: "Enough context to decide whether opening the section is worth the vertical space cost.",
  },
  {
    title: "What makes the content meaningful?",
    body: "The expanded panel answers the prompt directly instead of acting like placeholder filler.",
  },
] as const

export function AccordionShowcase() {
  return (
    <ShowcaseShell
      title="Accordion"
      description="Disclosure rhythm for stacked guidance, notes, and expandable review context."
      footer="Single-expand behavior keeps the card compact while still proving the open and closed states."
    >
      <Accordion type="single" collapsible>
        {items.map((item) => (
          <AccordionItem key={item.title} value={item.title}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              <p className="type-body text-foreground/90">{item.body}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ShowcaseShell>
  )
}

