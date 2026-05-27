import type { ScenarioDefinition } from "@/app/gallery/agent-lab/types"

const workspaceScope = { type: "workspace" } as const
const documentScope = { type: "document", documentId: "landing-doc" } as const
const heroTitleScope = { type: "block", blockPath: "hero.title" } as const
const heroBodyScope = { type: "block", blockPath: "hero.body" } as const
const summaryCardScope = { type: "block", blockPath: "summary.card" } as const
const ctaActionsScope = { type: "block", blockPath: "cta.actions" } as const

export const agentEventScenarios: readonly ScenarioDefinition[] = [
  {
    id: "block-rewrite-success",
    label: "Rewrite a block",
    description:
      "A block-scoped edit with short speaking, a concrete change summary, and a settled comment marker.",
    prompt: "Make this hero copy shorter and more restrained.",
    events: [
      { at: 0, type: "turn.started", prompt: "Rewrite selected block", scope: heroBodyScope },
      { at: 220, type: "pet.thinking", label: "Checking the role of this block", scope: heroBodyScope },
      { at: 520, type: "message.delta", chunk: "This block is acting as the lead-in. ", scope: heroBodyScope },
      { at: 820, type: "message.delta", chunk: "I can shorten it without dropping the cue for the next section.", scope: heroBodyScope },
      { at: 1180, type: "tool.started", label: "Updating this block", scope: heroBodyScope },
      {
        at: 1600,
        type: "outcome.recorded",
        outcome: {
          kind: "change",
          blockPath: "hero.body",
          changedFiles: 1,
          summary: "Copy shortened and the tone kept neutral.",
          title: "Updated this block",
        },
      },
      { at: 1880, type: "turn.completed", summary: "Updated this block.", scope: heroBodyScope },
    ],
  },
  {
    id: "block-explanation-only",
    label: "Explain a block",
    description:
      "A question about intent that produces a local explanation card without any file change.",
    prompt: "Why is this summary card so long?",
    events: [
      { at: 0, type: "turn.started", prompt: "Explain this block", scope: summaryCardScope },
      { at: 260, type: "pet.thinking", label: "Reading the neighboring blocks", scope: summaryCardScope },
      { at: 620, type: "message.delta", chunk: "The card is carrying both a summary and a CTA hint. ", scope: summaryCardScope },
      { at: 960, type: "message.delta", chunk: "That makes it read heavier than the rest of the section.", scope: summaryCardScope },
      {
        at: 1400,
        type: "outcome.recorded",
        outcome: {
          kind: "explanation",
          blockPath: "summary.card",
          body: "It is doing two jobs at once: section summary and transition cue.",
          title: "Why this reads long",
        },
      },
      { at: 1710, type: "turn.completed", summary: "Explained this block.", scope: summaryCardScope },
    ],
  },
  {
    id: "long-streaming-response",
    label: "Long streaming reply",
    description:
      "A speaking-heavy turn where Pet streams thought-like deltas before the result settles into a comment card.",
    prompt: "Talk me through what you would change here.",
    events: [
      { at: 0, type: "turn.started", prompt: "Talk through this block", scope: heroTitleScope },
      { at: 200, type: "pet.thinking", label: "Inspecting the section rhythm", scope: heroTitleScope },
      { at: 520, type: "message.delta", chunk: "I would keep the headline short. ", scope: heroTitleScope },
      { at: 860, type: "message.delta", chunk: "The detail already lives in the supporting card below. ", scope: heroTitleScope },
      { at: 1200, type: "message.delta", chunk: "So the title should carry direction, not explanation.", scope: heroTitleScope },
      {
        at: 1680,
        type: "outcome.recorded",
        outcome: {
          kind: "suggestion",
          blockPath: "hero.title",
          summary: "Keep the title directional and let the next card carry the details.",
          title: "Suggested change ready",
        },
      },
      { at: 1920, type: "turn.completed", summary: "Prepared a suggestion.", scope: heroTitleScope },
    ],
  },
  {
    id: "approval-required",
    label: "Needs approval",
    description:
      "A turn that pauses on permission, showing waiting in Pet and a blocked marker on the active block.",
    prompt: "Apply the change and run tests.",
    events: [
      { at: 0, type: "turn.started", prompt: "Edit and run tests", scope: ctaActionsScope },
      { at: 260, type: "pet.thinking", label: "Preparing the edit", scope: ctaActionsScope },
      { at: 700, type: "tool.started", label: "Ready to run npm test", scope: ctaActionsScope },
      {
        at: 1120,
        type: "approval.requested",
        reason: "Need permission to run npm test before completing this change.",
        actionLabel: "Allow",
        scope: ctaActionsScope,
      },
      {
        at: 1400,
        type: "outcome.recorded",
        outcome: {
          kind: "blocked",
          blockPath: "cta.actions",
          reason: "Waiting for approval to run tests.",
          title: "Blocked",
        },
      },
    ],
  },
  {
    id: "block-edit-failed",
    label: "Patch failed",
    description:
      "A failed turn that never lands a change and leaves a failure card on the affected block.",
    prompt: "Rewrite this block in source.",
    events: [
      { at: 0, type: "turn.started", prompt: "Rewrite source block", scope: heroBodyScope },
      { at: 240, type: "pet.thinking", label: "Matching the current source", scope: heroBodyScope },
      { at: 640, type: "tool.started", label: "Applying patch", scope: heroBodyScope },
      {
        at: 1220,
        type: "outcome.recorded",
        outcome: {
          kind: "failure",
          blockPath: "hero.body",
          reason: "This block no longer matches the current source.",
          title: "Couldn't complete this change",
        },
      },
      { at: 1490, type: "turn.failed", message: "Patch application failed.", scope: heroBodyScope },
    ],
  },
  {
    id: "multi-block-tone-pass",
    label: "Multi-block pass",
    description:
      "One turn touches several blocks, with Pet summarizing the sweep while each block receives its own outcome.",
    prompt: "Make the first three sections sound like one voice.",
    events: [
      { at: 0, type: "turn.started", prompt: "Run a three-block tone pass", scope: workspaceScope },
      { at: 250, type: "pet.thinking", label: "Comparing the first three sections", scope: workspaceScope },
      { at: 680, type: "message.delta", chunk: "I will align the hero, summary, and CTA tone. ", scope: workspaceScope },
      { at: 1080, type: "tool.started", label: "Updating 3 blocks", scope: workspaceScope },
      {
        at: 1480,
        type: "outcome.recorded",
        outcome: {
          kind: "change",
          blockPath: "hero.title",
          changedFiles: 1,
          summary: "Part of a 3-block tone pass.",
          title: "Updated this block",
        },
      },
      {
        at: 1640,
        type: "outcome.recorded",
        outcome: {
          kind: "change",
          blockPath: "summary.card",
          changedFiles: 1,
          summary: "Part of a 3-block tone pass.",
          title: "Updated this block",
        },
      },
      {
        at: 1790,
        type: "outcome.recorded",
        outcome: {
          kind: "change",
          blockPath: "cta.actions",
          changedFiles: 1,
          summary: "Part of a 3-block tone pass.",
          title: "Updated this block",
        },
      },
      { at: 2080, type: "turn.completed", summary: "Updated 3 blocks.", scope: workspaceScope },
    ],
  },
  {
    id: "document-level-analysis",
    label: "Document analysis",
    description:
      "A global assessment that should stay out of block markers while still feeling active in Pet and complete in Drawer.",
    prompt: "Is the whole document structure too scattered?",
    events: [
      { at: 0, type: "turn.started", prompt: "Review the document structure", scope: documentScope },
      { at: 260, type: "pet.thinking", label: "Checking section flow", scope: documentScope },
      { at: 760, type: "message.delta", chunk: "The sections are coherent, but the pacing is front-loaded. ", scope: documentScope },
      { at: 1180, type: "message.delta", chunk: "The middle cards could compress by one layer.", scope: documentScope },
      {
        at: 1560,
        type: "outcome.recorded",
        outcome: {
          kind: "document",
          documentId: "landing-doc",
          summary: "The document is readable, but the middle section is doing one layer too much.",
        },
      },
      { at: 1880, type: "turn.completed", summary: "Document review complete.", scope: documentScope },
    ],
  },
  {
    id: "cancelled-before-outcome",
    label: "Cancelled mid-turn",
    description:
      "A turn that reads and speaks briefly, then exits without any durable block result.",
    prompt: "Inspect this block and stop if it looks risky.",
    events: [
      { at: 0, type: "turn.started", prompt: "Inspect this block", scope: summaryCardScope },
      { at: 320, type: "pet.thinking", label: "Inspecting structure", scope: summaryCardScope },
      { at: 760, type: "tool.started", label: "Reading nearby blocks", scope: summaryCardScope },
      { at: 1120, type: "message.delta", chunk: "I found a few repeated cues, but I am stopping here. ", scope: summaryCardScope },
      { at: 1520, type: "turn.cancelled", reason: "Stopped before producing a durable outcome." },
    ],
  },
] as const
