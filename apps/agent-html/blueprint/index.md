# Agent-HTML Blueprint

## Purpose

Agent-HTML exists to turn agent output from transient chat text into durable AI-native artifacts.

It gives agents a structured medium for expressing work, and gives humans a clearer surface for
reading, judging, responding, and carrying that work forward. The goal is not to make agents design
web pages. The goal is to make AI work easier to understand, review, share, and continue.

## Product North Star

Agent-HTML is an AI-native artifact medium.

It should let an agent express a result as a previewable, reviewable, and collaborative artifact
rather than as a long block of Markdown. A good Agent-HTML artifact should feel closer to an
AI-era report, brief, or presentation surface: structured enough to scan, stable enough to trust,
and open enough for the next round of human feedback.

## Principles

### 1. AI-Native Artifact Medium

Agent-HTML should make AI work feel like a shared object, not a message that disappears into a
conversation stream.

The artifact should preserve the shape of the work: its claims, evidence, comparisons, decisions,
risks, and next steps. It should be useful during the conversation and still make sense after the
conversation has moved on.

### 2. LLM-Friendly Authoring

Agent-HTML should be easy for language models to produce consistently.

The authoring surface should reduce low-value decisions about presentation and implementation, so
the model can focus on structure, meaning, and judgment. The format should reward clear thinking
instead of encouraging decorative output or fragile one-off layouts.

### 3. Human Collaboration Surface

Agent-HTML should improve the way humans and agents work together.

The artifact is a shared surface for reading, comparing, reviewing, and giving feedback. It should
support the kind of collaboration that long chat answers handle poorly: scanning a complex result,
finding what matters, pointing at a section, asking for revision, and continuing from there.

### 4. Preview Loop First

Agent-HTML should treat preview as part of the work, not as a final export step.

Humans should be able to see the artifact take shape, react to it, and guide the next iteration.
The product should favor workflows where generation, review, feedback, and revision stay close
together.

### 5. Semantic and Reviewable

Agent-HTML should express meaning before appearance.

The same kind of content should have a stable expression, so readers do not need to relearn the
visual language for every artifact. The artifact should make assumptions, conclusions, evidence,
and actions easier to inspect. It should avoid hidden behavior and avoid turning implementation
details into part of the authoring task.

## Product Boundary

Agent-HTML is not a general website generator, a frontend project template, or a free-form UI
design tool.

It should not compete on arbitrary layout freedom, decorative novelty, or open-ended application
building. Its value should come from making agent work more structured, previewable, reviewable,
portable, and collaborative.
