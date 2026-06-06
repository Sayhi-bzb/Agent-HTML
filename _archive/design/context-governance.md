# Context Governance Blueprint

## Purpose

This document defines how project structure becomes development context.
It exists so code, files, examples, tests, and docs compound toward the intended architecture instead
of training future contributors to work around it.

## Ownership

This document owns project-level code-context governance.
It does not define frontend visual law, token values, component standards, or detailed directory
responsibilities. Those belong to the specialized documents in `design/` and the App, Runtime, and
Canvas docs.

## Core Principle

Code and file architecture are prompt infrastructure.

Every directory, import, file size, example, test, and exported name teaches humans and agents what
the project considers normal. Governance must make the intended implementation path visible,
repeatable, and cheaper than the wrong path.

Rules should not only reject bad changes. The repository should make good changes easy to copy.

## Governance Model

Project context is shaped by six layers:

1. documentation vocabulary
2. directory ownership
3. import direction
4. public contracts and types
5. canonical examples
6. tests and guards

These layers should say the same thing. When docs and code disagree, future contributors will trust
the code.

## Boundary Philosophy

Boundaries must be visible before they are enforced.

- names should reveal ownership
- directories should reveal responsibility
- imports should reveal allowed dependency direction
- public types should reveal the contract surface
- tests should protect contracts, not local taste
- bridge files should make cross-domain hosting explicit

Do not hide architecture inside helper functions, generic utility folders, or long tests that only a
maintainer can decode.

## Code Shape Rules

Large files create context gravity. They invite future edits to accumulate in the same place.

Prefer code shapes that preserve intent:

- orchestration files wire owned parts together and avoid owning domain logic
- protocol packages stay thin and do not absorb host, UI, filesystem, or theme behavior
- feature domains own their state, adapters, and content registries
- shared utilities stay boring, narrow, and dependency-light
- bridge modules name both sides of the boundary they connect
- file-local helpers stay local until reuse is real and the owner is clear

Promote structure when repeated code is teaching a durable pattern. Avoid promotion when it only
hides one-off complexity behind a broad name.

## Examples and Tests

Examples are policy.

Canonical examples should be short, orthogonal, and easy to imitate. They should demonstrate one
stable pattern at a time. A large showcase can be useful for coverage, but it must not become the
primary example agents copy.

Tests and guards should encode project contracts:

- import boundaries
- protocol surfaces
- package ownership
- workspace shape
- runtime behavior
- public API compatibility

Prefer structural analysis for code contracts. Use text matching for text files, generated output,
and simple presence checks.

## Review Direction

A context-governance review should ask:

- Does this change strengthen the intended architecture as future context?
- Is the new code in the owner that future contributors would expect?
- Does the import direction match the boundary vocabulary?
- Is this file becoming a gravity center?
- Would an agent copy this example and produce better code next time?
- Is the test protecting a contract, or encoding taste as a brittle rule?
- Does the correct path remain cheaper than the workaround?

If a change needs an exception, document the owner, reason, and normalization path.
