import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger as RuntimeAccordionTrigger,
} from "@/agent-html/runtime/ui/accordion"

function AccordionTrigger(
  props: React.ComponentProps<typeof RuntimeAccordionTrigger>
) {
  return (
    <RuntimeAccordionTrigger
      data-selection="none"
      data-cursor="action"
      {...props}
    />
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
