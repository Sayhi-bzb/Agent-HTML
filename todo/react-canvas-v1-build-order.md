# React Canvas v1 Build Order

Date: 2026-06-03

## Purpose

Build the React Canvas route in thin slices. Each slice should be useful without
requiring the full desktop app or Codex bridge.

## Step 1: React API

Create the minimum `@agent-html/react` API:

```tsx
Artifact
Block
Action
```

The first implementation can be lightweight React components that render their
children and expose metadata for the host. Do not design a broad component
framework.

## Step 2: Base Playground

Define the base `.agent-html/` playground installed by init or registry:

```text
.agent-html/
  artifacts/
  ui/
  hooks/
  lib/
  schema/
  data/
  examples/
  AGENTS.md
  manifest.json
```

Base content should include enough UI, hooks, lib utilities, examples, and rules
for an agent to write a first artifact without hand-rolling the visual system.

Do not add `patterns/` in v1 base.

## Step 3: Guard Reporting

Add `agent-html guard` as report-only first.

It should report collaboration and visual stability issues without rewriting
files.

Minimum checks:

- default export exists
- `Artifact` is used
- at least one `Block` is used
- each `Block` has an id
- block ids are unique
- obvious unstable ids are warned
- obvious one-giant-block artifacts are warned
- unsafe visual styling is warned

## Step 4: Localhost Host

Add `agent-html dev` for local preview.

Minimum host behavior:

- scan `.agent-html/artifacts/*.agent.tsx`
- show artifact list
- render selected artifact
- show source file path
- show Guard warnings
- reload on source changes

The host should work without Codex app-server.

## Step 5: Block Overlay

Add block-aware review affordances:

- block hover state
- block selection state
- block id/title display
- copy block reference
- block message input opened from the block icon
- compact prompt packaging with file path, block path, selected source, and user
  request
- submit block prompt payloads to the bridge interface
- debug adapter displays structured payload and formatted prompt
- clipboard adapter copies formatted prompt

This is the first slice where AgentHTML becomes more than a React previewer.

## Step 6: Bridge Adapters

Add optional `Action` handling and keep execution backends behind adapters.

Minimum behavior:

- display available actions
- let a user trigger an action
- build a target-aware prompt
- send the prompt payload through the same bridge interface

V1 ships with debug and clipboard adapters. Codex app-server is a v1.1 adapter.
It is not the source of truth and not required for the host to preview artifacts.

## Completion Criteria

v1 is useful when an agent can:

1. create `.agent-html/artifacts/foo.agent.tsx`
2. reuse `.agent-html/ui`, `hooks`, and `lib`
3. wrap major sections in `Block`
4. run Guard
5. preview on localhost
6. inspect or copy a bridge-formatted block prompt for a follow-up edit
