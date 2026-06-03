# React Canvas Guard

Date: 2026-06-03

## Purpose

AgentHTML Guard checks whether an agent-authored React artifact is suitable for
collaboration and visual stability.

It is closer to ESLint than to a runtime renderer. It should report problems
first. Automatic rewriting can come later.

## V1 Mode

V1 Guard is report-only.

It should produce actionable messages that tell the agent what to change:

```text
Unsafe className on line 42:
bg-purple-900 rounded-3xl shadow-2xl
Use AgentHTML default styling or .agent-html/ui components instead.
```

## Collaboration Checks

Minimum checks:

- artifact file has a default export
- default export appears to be a React component
- artifact uses `Artifact`
- artifact uses at least one `Block`
- every `Block` has an `id`
- block ids are unique within the artifact
- block ids are readable kebab-case
- warn on unstable ids such as `block1`, `section2`, `temp`, or `top`
- warn on obvious one-giant-block artifacts

Guard should not require every paragraph or button to be a block. Block
boundaries should map to semantic regions users might review or ask an agent to
rewrite.

## Visual Checks

Warn on:

- inline visual `style`
- raw color classes
- gradients
- heavy shadows
- large radii
- arbitrary Tailwind values
- custom font classes
- tracking or letter-spacing drift
- hand-rolled button, card, table, badge, alert, empty state, separator,
  skeleton, dialog, or tooltip markup when a local `ui/` component exists

Guard should allow React state, hooks, event handlers, derived data, native HTML,
and local components.

## ClassName Policy

Default mode should be strict for agent-generated artifacts:

- no visual `style`
- no visual `className`
- use AgentHTML default CSS and `.agent-html/ui` components

Safe layout classes can become an explicit later mode. Examples may include:

```text
sr-only
hidden
min-w-0
overflow-hidden
```

Do not add a broad escape hatch in the first Guard slice.

## Output Expectations

Guard output should include:

- file path
- issue severity
- location when available
- short reason
- suggested fix

Warnings should be written for agents as much as humans. The fix should name the
preferred local asset when possible, such as `../ui/card` or `../ui/button`.
