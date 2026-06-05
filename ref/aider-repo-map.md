# Aider Repo Map

## What It Is

Aider Repo Map is Aider's repository-wide context index: a compact map of files plus important classes, functions, methods, types, and signatures that Aider sends with each coding request. Official docs: [Repository map](https://aider.chat/docs/repomap.html), [repo-map blog post](https://aider.chat/2023/10/22/repomap.html), [CLI options](https://aider.chat/docs/config/options.html), [GitHub repo](https://github.com/Aider-AI/aider), and current implementation entry point [`aider/repomap.py`](https://github.com/Aider-AI/aider/blob/main/aider/repomap.py).

## Agent-Ergonomics Value

The value is orientation before file reads. Aider parses source with tree-sitter queries, extracts definitions and references, ranks symbols/files through a dependency graph, and emits only the highest-value code lines that fit the active map budget. That gives an agent a cheap architectural scan: what files exist, which symbols are central, and which files should be opened next.

Compared with `.d.ts`, a repo map is more agent-oriented: it spans languages, includes concrete file paths, preserves selected source signatures/lines, and ranks by cross-file relevance. `.d.ts` is better as a TypeScript API contract for exported surfaces, but it misses private implementation structure, runtime files, non-TS artifacts, and importance ranking.

## Output Quality

The output is readable markdown-like text grouped by file, with elided source lines and symbol snippets. It is diffable and can be captured with `aider --show-repo-map > map.md`; Aider's FAQ explicitly suggests redirecting maps for cross-repo context. It is not ideal as committed canonical output: ranking depends on Aider version, tree-sitter query coverage, token budget, chat state, mentioned files/idents, ignored files, and refresh policy.

Token behavior is central. `--map-tokens` is the suggested repo-map budget and can be set to `0` to disable it; docs describe a default around 1k tokens and dynamic expansion, especially when no files are in chat. Related options include `--map-refresh` and `--map-multiplier-no-files`. This makes the map good prompt context, but a weak durable index unless generation inputs are pinned.

## Fit For `.agent-html/index/`

Imitate

The project should not adopt Aider directly as the index owner. `.agent-html/index/` needs durable, host-readable, project-specific source that agents can inspect and diff as part of this repo's collaboration contract. Aider's algorithm is the useful part: syntax-aware symbol extraction, reference graph construction, ranking under a token budget, and compact source-line rendering.

## Integration Shape

Test Aider as a benchmark, not as the production generator:

```powershell
aider --show-repo-map --map-tokens 4096 --exit > D:\tmp\agent-html-aider-map.md
```

If imitated, build a local generator with this shape:

```powershell
node tools/generate-agent-html-index.mjs --root . --out .agent-html/index/repo-map.md --tokens 4096
```

Implementation should use tree-sitter or TypeScript compiler APIs for extraction, build a file/symbol reference graph, rank by inbound references plus project-specific route/entrypoint weights, and render stable markdown with deterministic ordering and pinned budgets.

## Risks

Aider output can create false confidence: a compact map hides low-ranked files that may still own behavior. Tree-sitter coverage varies by language and query quality; Aider docs note repo-map support depends on each language's `tags.scm`. For this repo, TS/TSX path aliases, generated artifacts, MDX docs, AgentHTML DSL files, and package/workspace boundaries need project-specific handling that Aider may not model well. Direct adoption also adds Python/Aider dependency weight and couples index semantics to an external prompt tool.

## Recommendation

Imitate Aider Repo Map's ranking model, using one captured Aider map as a comparison fixture; next step is a small local `.agent-html/index/` prototype with deterministic TS/TSX/MDX/AgentHTML extraction.
