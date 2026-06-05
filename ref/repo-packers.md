# Repo To Prompt Packers

## What It Is

[Repomix](https://repomix.com/) ([GitHub](https://github.com/yamadashy/repomix)) packs local or remote repositories into AI-oriented XML, Markdown, JSON, or plain text. It supports include/exclude globs, `.gitignore`, config files, token-count views, code compression, comment removal, git diffs/logs, remote branch/commit selection, split output, and Secretlint-based security checks.

[Code2Prompt](https://code2prompt.dev/) ([GitHub](https://github.com/mufeedvh/code2prompt)) is a Rust CLI, core library, Python SDK, and MCP server for converting a codebase into a templated LLM prompt. It supports glob filtering, `.gitignore`, Handlebars templates, token counting, JSON output, line numbers, git diffs/logs, branch comparisons, and clipboard/stdout/file output.

[Gitingest](https://gitingest.com/) ([GitHub](https://github.com/coderamp-labs/gitingest)) turns a Git repository URL or local directory into a prompt-friendly text digest. It has a web app, CLI, Python API, browser extensions, self-hosting path, include/exclude patterns, `.gitignore` handling, file-size limits, token count statistics, private-repo PAT support, and summary/tree/content output.

## Agent-Ergonomics Value

Repomix is the strongest fit for agent use when an agent needs a bounded, reproducible context bundle. The token tree helps choose files before reading them, include/ignore patterns keep task context narrow, JSON output can be post-processed, and security checks reduce accidental prompt leakage. It is still a packer, not an index: it preserves a point-in-time slice, not symbol relationships or long-term architectural memory.

Code2Prompt is useful when prompt shape matters. Templates are its main ergonomic value: an agent can generate task-specific context for review, commit messages, PR summaries, or migration work without reformatting files manually. The SDK/MCP surface makes it easier to test inside agent workflows, but the output is still a temporary prompt payload.

Gitingest is useful for quick remote inspection. The `hub` to `ingest` URL trick, web UI, and Python `ingest()` API lower friction when scanning unfamiliar public repos. It is less useful for repository automation because it is optimized for a simple digest, not durable selection policy or repo-native architecture context.

## Output Quality

Repomix output is the most structured and automation-friendly. XML is model-readable, Markdown is human-readable, JSON is machine-readable, and plain text is lowest-friction. With a checked-in config, pinned version, and stable file ordering, it can be diffable; however, full packed source snapshots are usually too noisy and too stale to be commit-worthy. A small generated manifest, token report, or command fixture could be commit-worthy.

Code2Prompt output quality depends on the template. Markdown prompt output is readable but often not diff-worthy because line numbers, git metadata, branch comparisons, and broad file selection can churn. JSON output includes the generated prompt and token count, which is useful for automation tests, but it does not become an architectural index unless another layer extracts and owns durable facts.

Gitingest output is readable as a one-file digest with summary statistics, directory tree, and file contents. It is intentionally simple, which makes it easy to paste and poor as a committed artifact. Remote/web runs also make provenance and reproducibility weaker unless command, version, commit, filters, and size limits are captured elsewhere.

## Fit For `.agent-html/index/`

| Tool | Verdict | Reason |
| --- | --- | --- |
| Repomix | Imitate | Borrow token accounting, deterministic filters, structured JSON, and secret scanning. Do not commit full packs as index artifacts. |
| Code2Prompt | Defer | Useful external prompt generator and possible MCP/SDK experiment, but templates produce task prompts rather than durable repo indexes. |
| Gitingest | Reject | Good ad hoc reader for external repos; too broad and digest-oriented for `.agent-html/index/`. |

Overall verdict: Imitate, not Adopt. `.agent-html/index/` should remain a durable, repo-specific index with stable facts and routes, not a regenerated paste buffer.

## Integration Shape

If tested, keep packers outside committed automation first:

```powershell
npx repomix --style json --include "apps/docs/content/docs/app/**,apps/docs/content/docs/runtime/**,design/**" --ignore "**/node_modules/**,**/dist/**" --token-count-tree --output D:\tmp\agent-html-repomix.json
```

```powershell
code2prompt . --include="apps/docs/content/docs/**/*.mdx,design/**/*.md" --exclude="**/node_modules/**,**/dist/**" --tokens --json --output=D:\tmp\agent-html-code2prompt.json
```

```powershell
gitingest . --output D:\tmp\agent-html-gitingest.txt
```

If any behavior is adopted into repo automation, prefer a local script that writes small stable index artifacts: selected paths, token counts by route, source hashes, and extraction metadata. Run secret scanning before any generated context leaves the workspace.

## Risks

Noise: broad repository packs encourage agents to skim giant blobs instead of following content routes.

Maintenance cost: pinning CLI versions, templates, tokenizer behavior, ignore rules, and generated-output expectations adds work without improving the durable index by itself.

Stale output: committed packs drift immediately after source changes and can create false confidence if agents read the pack instead of current files.

Dependency weight: Repomix adds a Node CLI dependency; Code2Prompt adds Rust/Python/MCP options; Gitingest adds Python and optional server dependencies.

Secret exposure: Repomix documents built-in Secretlint checks. Code2Prompt and Gitingest should be treated as requiring external secret scanning before output is shared or committed.

False confidence: token counts and directory trees help with scale, but they do not explain ownership, runtime boundaries, API contracts, or TypeScript import semantics.

TS path support: none of the tools is a TypeScript-aware architecture index. They may include files matched by glob, but they do not resolve this repo's module boundaries or path aliases into durable relationships.

## Recommendation

Do not adopt any packer as committed `.agent-html/index/` automation. Next step: imitate Repomix's best behaviors in the existing index direction by adding deterministic path selection, token-count summaries, source hashes, and a required secret-scan gate for any exported context bundle.
