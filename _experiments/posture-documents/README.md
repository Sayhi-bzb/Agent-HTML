# Posture Documents Experiment

This directory is a lab for testing whether document form changes agent
behavior.

It is not project law. It is not a new route for normal work. Formal AE theory
stays in `../../taste/agent-ergonomics/`; first-person working notes stay in
`../../docs/diary/`.

## Question

Can a posture document create stronger session gravity than a rule document?

The experiment compares the same read-only task under different context
anchors. The result should be judged by observable behavior, not by whether the
answer sounds more polished.

## Files

- `task.md` owns the fixed task.
- `postures.md` owns the prompt conditions.
- `rubric.md` owns the observation criteria.

## Run

Spawn separate read-only agents. Give each agent one task and one prompt
condition.

Run both tasks:

1. narrow-task
2. open-task

Run every task under every condition:

1. control
2. rule-form
3. diary-form
4. over-anchored

That creates eight runs. Record differences against `rubric.md`. Do not
promote a result into formal AE guidance until the pattern repeats across runs.
