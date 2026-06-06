# AE Vocabulary

Stable words reduce routing work. Use one term for one AE concept.

## Core Terms

- **Agent Ergonomics / AE**: the design discipline for reducing agent cognitive
  load in project workspaces.
- **Context Ergonomics**: the AE theory that project context shapes agent
  behavior.
- **Session Semantic Gravity**: the session-level Context Ergonomics concept
  for how repeated semantic anchors in conversation shape later agent
  reasoning.
- **Context Route**: the default path from task prompt to smallest useful
  context.
- **Route Check**: the audit method that tests whether a route works for a
  cold-start agent.
- **Route Script**: one concrete route check scenario with expected path, avoid
  path, pass criteria, and failure smells.

## Document Roles

- **README**: route file. It orients and points elsewhere.
- **AGENTS**: hard operating rules for agents.
- **Guide**: experience-based choice guidance. It should not duplicate hard
  rules or API surfaces.
- **API surface**: compact export map. It answers what can be imported, not what
  should be chosen.
- **Example**: copyable policy. It carries normative weight.
- **Generated index**: decision summary from tooling. It is context, not design
  intent.

## Normative Example

Examples, fixtures, demos, README snippets, and gallery code carry normative
weight because agents copy concrete patterns more readily than abstract rules.

Good examples should be compact, current, and layer-correct. Bad or temporary
examples may exist, but they should be isolated, named, marked, or kept away
from the first route path.

## Constraint Levels

- **Hard rule**: violation is wrong, such as styling protocol markers or
  importing host internals from artifacts.
- **Route default**: the expected first path unless the task clearly asks for
  another layer.
- **Practice**: strong experience, but context may override it.
- **Heuristic**: first-search-space reduction.
- **Smell**: a signal to stop and inspect, not an automatic failure.

Do not promote practices or smells into hard rules unless violating them breaks
an explicit boundary.

Do not turn route checks into project law. If a rule must be enforced during
implementation, put the rule in the owning `AGENTS.md` or feature contract and
link to it from AE.
