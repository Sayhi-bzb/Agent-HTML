# Code Intelligence Indexes

## What It Is

SCIP is a language-agnostic code intelligence protocol for precise navigation: go to definition, find references, find implementations, hover data, symbol metadata, and cross-repository links. The core project provides a protobuf schema, Go/Rust/TypeScript/Haskell bindings, and a `scip` CLI for linting, printing, snapshotting, stats, and experimental SQLite conversion.

Links: [SCIP](https://github.com/scip-code/scip), [SCIP protobuf schema](https://github.com/scip-code/scip/blob/main/scip.proto), [SCIP CLI](https://github.com/scip-code/scip/blob/main/docs/CLI.md), [scip-typescript](https://github.com/sourcegraph/scip-typescript), [Sourcegraph TypeScript indexing docs](https://sourcegraph.com/docs/code-navigation/how-to/index-a-typescript-and-javascript-repository).

Similar systems: [LSIF](https://lsif.dev/) is the older language-server dump format; [Kythe](https://kythe.io/docs/kythe-overview.html) is a broader language-agnostic graph for compiler/build/code facts; [Glean](https://glean.software/docs/schema/basic/) is a fact database with schema/query layers. SCIP is the most directly relevant for local JS/TS symbol and reference indexing.

## Agent-Ergonomics Value

SCIP can help an agent avoid broad source reads by answering symbol-level questions: where a symbol is defined, where it is referenced, what file owns it, what kind it is, and which implementation or type-definition edges exist. For architecture preservation, it is useful as a backend fact source that can produce compact summaries like "public exports by module", "hot symbols by reference count", "entrypoints and consumers", and "changed symbol blast radius".

The raw index is not agent-ergonomic. It is optimized for code navigation clients, not for direct LLM reading. The value appears after a reducer converts the protobuf or JSON into small, stable, repo-specific summaries.

## Output Quality

`scip-typescript index` generates `index.scip`, a protobuf file containing metadata, documents, occurrences, symbol definitions, symbol roles, relationships, signatures, documentation, diagnostics, ranges, and external symbols. It is machine-readable and precise when the TypeScript project and dependencies resolve correctly.

Raw `.scip` output is binary, large, and not useful in review diffs. `scip print --json` is readable by tools but likely too large and noisy to commit. `scip snapshot` creates human-inspectable snapshots for indexer tests, but those snapshots are still symbol-density artifacts rather than concise project knowledge. `scip stats` and an internal reducer are better candidates for commit-worthy summaries.

Stability is good at the schema level, but exact output can change with TypeScript versions, dependency installs, path resolution, generated files, and indexer upgrades. Treat generated SCIP data as cache/backend input, not source documentation.

## Fit For `.agent-html/index/`

Defer.

SCIP is too heavy for `.agent-html/index/` v1 as committed project context. It is useful later as an internal backend for generating smaller agent-readable index files. The v1 index should imitate the useful outputs, not adopt the raw format: compact module summaries, exported symbols, public references, ownership boundaries, route/entrypoint maps, and "read this first" file rankings.

## Integration Shape

Test locally as an optional backend:

```sh
npm install --save-dev @sourcegraph/scip-typescript
npx scip-typescript index
scip stats --from index.scip
scip print --json index.scip > .agent-html/tmp/scip.json
node tools/reduce-scip-index.mjs .agent-html/tmp/scip.json .agent-html/index/code-symbols.json
```

For this repo, the reducer should emit only small derived files, for example:

```txt
.agent-html/index/symbols.json
.agent-html/index/module-refs.json
.agent-html/index/entrypoints.json
.agent-html/index/agent-summary.md
```

The reducer API should accept `projectRoot`, `include`, `exclude`, `maxReferencesPerSymbol`, and `symbolKinds` options, then output deterministic sorted JSON/Markdown. Do not commit `index.scip` or full `scip print --json` output.

## Risks

Noise: full occurrence data is much larger than the facts an agent needs.

Maintenance cost: adds another indexer, CLI, reducer, version pin, and stale-output policy.

Stale output: symbol facts can mislead agents if not regenerated after refactors.

Dependency weight: local generation requires installed dependencies and TypeScript project resolution; CI or developer machines may diverge.

False confidence: precise navigation facts do not explain architectural intent, domain rules, or runtime behavior.

Path support: TS monorepos, workspace boundaries, generated files, aliases, and unusual `tsconfig` setups need validation before relying on references.

Review quality: raw protobuf or JSON output is not diff-friendly or commit-worthy.

## Recommendation

Defer raw SCIP for v1; later prototype a `scip-typescript` reducer that turns `index.scip` into compact `.agent-html/index/` summaries.
