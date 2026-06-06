import type { StructureFile, WorkflowStep } from "./types"

export const structureFiles: StructureFile[] = [
  {
    path: "example.artifact.tsx",
    role: "Overview",
    readWhen: "Understand artifact order, block ids, and shared data flow.",
  },
  {
    path: "example/*.block.tsx",
    role: "Semantic blocks",
    readWhen: "Edit one visible section without opening the whole artifact.",
  },
  {
    path: "example/data.ts",
    role: "Facts",
    readWhen: "Change local rows, options, maps, or static structures.",
  },
  {
    path: "example/copy.ts",
    role: "Copy",
    readWhen: "Change labels, descriptions, and longer prose.",
  },
  {
    path: "example/types.ts",
    role: "Types",
    readWhen: "Change artifact-local data contracts.",
  },
]

export const workflowSteps: WorkflowStep[] = [
  {
    id: "scan",
    label: "Scan the artifact entry",
    summary:
      "Open the *.artifact.tsx file first. It should show block order, ids, and artifact shape before implementation details.",
  },
  {
    id: "target",
    label: "Choose one block",
    summary:
      "Use the Block id and matching *.block.tsx filename to reach the section that needs work.",
  },
  {
    id: "edit",
    label: "Edit locally",
    summary:
      "Keep local UI, copy, state, and helper components inside the block folder unless another artifact needs them.",
  },
  {
    id: "verify",
    label: "Verify the contract",
    summary:
      "Run the Canvas guard and typecheck so split files still obey artifact, primitive, and style boundaries.",
  },
]
