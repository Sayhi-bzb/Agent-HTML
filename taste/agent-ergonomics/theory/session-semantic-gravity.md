# Session Semantic Gravity

Session Semantic Gravity is the Context Ergonomics concept for conversation
state.

It describes the inference pull created when repeated, related semantic anchors
inside a session make later agent reasoning cluster around a stable behavioral
state.

## Model

### Human Seed

The user can set a light anchor with a few words: a role, a task frame, a mood,
or a vocabulary choice.

Examples:

- "Think like a physicist."
- "Treat this as architecture cleanup."
- "Avoid choice overload."
- "Keep the current route narrow."

A light anchor can steer one answer. It is easy to override.

### Agent Amplification

The agent writes much more text than the user. Its outputs become new context.

When the agent repeats stable terms, route names, boundary language, and
judgment criteria, it strengthens the session's semantic field. The next answer
is then more likely to continue inside that field.

This is useful when the agent amplifies correct anchors. It is dangerous when
the agent invents speculative architecture, false names, or confident but
unverified framing.

### Gravity Cluster

Strong session gravity appears when anchors are:

- repeated across turns;
- related to each other;
- tied to concrete routes, examples, files, or constraints;
- used by both user and agent;
- reflected in recent agent summaries and decisions.

At that point, the session does not merely contain instructions. It has a
working vibe that biases future interpretation.

### Drift Risk

Session gravity can trap the agent.

If the agent over-explains a wrong frame, it may keep reasoning inside that
frame because the frame now occupies recent context. Bad gravity feels coherent
while moving away from repo truth.

## Practices

- Use stable terms for stable concepts.
- Let agent summaries reinforce route, boundary, owner, and constraint
  vocabulary.
- Keep long explanations grounded in files, source owners, or observable repo
  state.
- Mark speculation as speculation.
- Do not invent architecture names to make a thin idea feel real.
- When the task changes direction, restate the new anchors and drop stale ones.
- Treat agent output as a context-shaping artifact, not just a response.

## Non-Claim

This is a working AE model, not a claim about exact transformer internals.

It names a practical effect: session text can shape later agent behavior, and
agent-generated text can become one of the strongest shaping signals in the
session.
