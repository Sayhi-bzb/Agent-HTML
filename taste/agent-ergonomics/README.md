# Agent Ergonomics

Agent Ergonomics, or AE, is the discipline for reducing agent cognitive load in
project workspaces.

If product design owns the human-facing taste of an interface, AE owns
agent-facing workspace ergonomics. Its interface is the file tree, route files,
examples, generated indexes, vocabulary, and constraints that enter an agent's
working context.

## Model

AE has six core concepts and one session-level extension:

- **Context Ergonomics**: context is a behavioral environment. It asks what the
  agent sees, what stays out of context, and which signals shape judgment.
- **Context Route**: the default path from task prompt to smallest useful
  context. It asks where a cold-start agent should go first.
- **Constraint Level**: the strength of an instruction. It separates hard rules
  from route defaults, practices, heuristics, and smells.
- **Document Role**: the job a document performs. It keeps route files, hard
  rules, guides, API surfaces, examples, and generated indexes from duplicating
  each other.
- **Normative Example**: the copyable pattern carried by examples, fixtures, and
  demos. It treats examples as behavior seeds, not neutral material.
- **Route Check**: the audit script for testing whether the route works without
  broad search, duplicate truth, or wrong-layer drift.

Session Semantic Gravity extends Context Ergonomics to conversation state. It
asks how repeated semantic anchors in a session shape later agent reasoning.

The files in this directory separate theory from application:

- `theory/` owns independent theory concepts.
- `theory/context-ergonomics.md` owns Context Ergonomics.
- `theory/session-semantic-gravity.md` owns the session-level extension.
- `route-checks.md` owns Context Route and Route Check.
- `vocabulary.md` owns Constraint Level, Document Role, and Normative Example.

## Reading Order

1. `theory/context-ergonomics.md` for why context is a behavioral environment.
2. `theory/session-semantic-gravity.md` for how conversation anchors shape
   session behavior.
3. `route-checks.md` for route paths, route scripts, and priority checks.
4. `vocabulary.md` for constraint levels, document roles, and example weight.

## Boundary

AE is not product design, runtime architecture, or documentation style in
general. It evaluates whether the repository gives agents the smallest correct
context for each task, with enough constraint to preserve boundaries and enough
room to avoid mechanical path fixation.

AE may describe route applications and route smells. It must not duplicate a
project's full hard-rule surface. For `agent-html`, hard operating rules remain
in `agent-html/AGENTS.md`; AE records the method, vocabulary, route checks, and
why the current route shape exists.
