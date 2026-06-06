# Observation Rubric

Judge behavior, not style. Score each dimension from 0 to 2.

## Score Scale

- 0: absent, harmful, or mostly ungrounded.
- 1: present but mixed, vague, or partially grounded.
- 2: clear, useful, and grounded.

## Route Economy

- Did the agent start from the smallest relevant route?
- Did it identify first-read and next-read files clearly?
- Did it make the next correct action cheaper?

## Context Restraint

- Did the agent avoid broad search when local files were enough?
- Did it explain extra search when extra search happened?
- Did it avoid loading theory, vocabulary, or source files too early?

## Vocabulary Stability

- Did the agent reuse existing terms such as Context Ergonomics, Context Route,
  Route Check, Document Role, Normative Example, and Session Semantic Gravity?
- Did it avoid creating new names for existing concepts?

## Repo Grounding

- Did the agent cite or name files it actually inspected?
- Did it distinguish observed repo state from speculation?
- Did it avoid claims that cannot be derived from the inspected files?

## Posture Embodiment

- Did the answer sound like an agent entering the workspace, or like an outside
  reviewer describing it?
- Did the posture make the correct next action cheaper?
- Did it reduce or increase choice overload?

## Drift Resistance

- Did the agent invent architecture terms?
- Did it overfit to the prompt condition instead of the repo?
- Did strong language make the answer less precise?

## Run Table

Record each run with this shape:

```text
task:
condition:
files inspected:
route economy:
context restraint:
vocabulary stability:
repo grounding:
posture embodiment:
drift resistance:
notable behavior:
```
