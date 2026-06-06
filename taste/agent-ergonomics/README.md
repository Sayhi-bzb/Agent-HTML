# Agent Ergonomics

Agent Ergonomics, or AE, is the discipline for reducing agent cognitive load in
project workspaces.

If product design owns the human-facing taste of an interface, AE owns
agent-facing workspace ergonomics. Its interface is the file tree, route files,
examples, generated indexes, vocabulary, and constraints that enter an agent's
working context.

## Model

- `context-ergonomics/`: the theory of how project context shapes agent
  behavior.
- `route-checks.md`: the audit method for testing whether a cold-start agent can
  follow the intended context path.
- `vocabulary.md`: the stable AE terms used to separate routes, rules, guides,
  examples, generated indexes, and smells.

## Reading Order

1. `context-ergonomics/constitution.md` for why context is a behavioral
   environment.
2. `context-ergonomics/principles.md` for stable operating principles.
3. `context-ergonomics/practices.md` for concrete workspace practices.
4. `route-checks.md` for route check scenarios and failure signals.
5. `vocabulary.md` when naming or reviewing AE concepts.
6. `context-ergonomics/field-notes.md` for project experience.

## Boundary

AE is not product design, runtime architecture, or documentation style in
general. It evaluates whether the repository gives agents the smallest correct
context for each task, with enough constraint to preserve boundaries and enough
room to avoid mechanical path fixation.
