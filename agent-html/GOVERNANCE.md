# AgentHTML Governance

This file is the low-frequency route for maintaining agent-facing workspace
behavior.

Read it when changing workspace conventions, route files, artifact or data
patterns, generated indexes, or examples that future agents may copy. Do not
read it for ordinary artifact authoring.

## Ownership

- `AGENTS.md` owns hard rules and default behavior.
- `README.md` owns conditional reading routes.
- `TASTE.md` owns artifact design judgment.
- `artifacts/README.md`, `components/README.md`, and `styles/README.md` own
  source routes.
- `index/*` owns generated decision summaries, not design intent.

Do not duplicate the same rule across these files. Link to the owner or move
the rule to the owner.

## Rule Placement

- Put hard executable rules in `AGENTS.md`.
- Put route choices in `README.md` files.
- Put judgment that depends on subject, media, layout, or component choice in
  `TASTE.md`.
- Put generated facts in `index/*` only when they answer one routing question.
- Leave routine style norms in code and existing examples when the environment
  already teaches them.

If a rule will not change the next correct agent action, do not write it.

## Copyable Weight

Artifacts, examples, fixtures, and demos are behavior seeds. Agents copy
concrete patterns more readily than abstract rules.

Keep first-route examples compact, current, and subject-specific. Do not let a
temporary workaround, weak name, stale artifact, or broad coverage fixture look
like the default project pattern.

## Artifact And Data Patterns

Artifact and block names should identify the subject and semantic work area.
Avoid making position, layout shape, or template labels look normative.

Keep data owners narrow. Artifact data stays artifact-local unless multiple
artifacts consume it. Generated or raw records stay separate from authored
interpretation so agents can tell data products from design judgment.

## Review Questions

- Which file owns this rule?
- Is this a hard rule, route default, judgment, generated fact, or smell?
- Will future agents copy this example?
- Does this add a new route, or make an existing route cheaper?
- Is this rule still needed if current code shape already teaches the behavior?
