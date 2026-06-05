# Principles

## Workspace as Interface

The workspace is not just storage. It is the interface agents use to understand, edit, and verify the project.

File and directory names should therefore describe the task route they support, not only the implementation category they contain.

## Context Routing

Each task should have an obvious first context anchor.

Examples:

- artifact generation starts from artifact rules and examples;
- theme work starts from token and preset ownership;
- host chrome work starts from host feature styles and host code;
- runtime contract work starts from schema, renderer, and boundary docs.

When a task has no obvious anchor, agents search broadly. Broad search is a sign that the information architecture is weak.

## Progressive Disclosure

Common paths stay shallow. Specialized paths sit behind clear domain names.

This keeps the default context small while preserving access to the full system when the task demands it.

## Noise Budget

Every file opened spends attention.

Mixed-purpose files, oversized entrypoints, and vague directories increase context entropy. Split them when the split improves task routing, not merely because a file is large.

## Anchor Precision

A context anchor is precise when an agent can infer what it owns before opening it.

Good anchors use stable domain names such as `artifacts`, `examples`, `ui`, `tokens`, `features`, `theme`, `schema`, and `data`.

Weak anchors use generic names that force inspection, such as `misc`, `common`, `helpers`, or broad files that combine unrelated layers.

## Layer Respect

Agent work should touch the layer requested by the task.

Content work should not drift into theme implementation. Theme work should not rewrite primitives. Host inspection chrome should not leak into artifact source.
