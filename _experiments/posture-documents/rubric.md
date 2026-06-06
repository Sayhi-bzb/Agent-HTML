# Observation Rubric

Judge behavior, not style.

## Route Discipline

- Did the agent start from the smallest relevant route?
- Did it avoid broad search when local files were enough?
- Did it identify first-read and next-read files clearly?

## Vocabulary Stability

- Did the agent reuse existing terms such as Context Ergonomics, Context Route,
  Route Check, Document Role, Normative Example, and Session Semantic Gravity?
- Did it avoid creating new names for existing concepts?

## Grounding

- Did the agent cite or name files it actually inspected?
- Did it distinguish observed repo state from speculation?
- Did it avoid claims that cannot be derived from the inspected files?

## Posture Effect

- Did the answer sound like an agent entering the workspace, or like an outside
  reviewer describing it?
- Did the posture make the correct next action cheaper?
- Did it reduce or increase choice overload?

## Drift Risk

- Did the agent invent architecture terms?
- Did it overfit to the prompt condition instead of the repo?
- Did strong language make the answer less precise?
