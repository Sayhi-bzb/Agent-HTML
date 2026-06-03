import { z } from "zod"

export const researchItemSchema = z.object({
  date: z.string(),
  name: z.string(),
  signal: z.string(),
  status: z.enum(["ready", "watch", "risk"]),
})

export type ResearchItem = z.infer<typeof researchItemSchema>

export const researchItemsSchema = z.array(researchItemSchema)
