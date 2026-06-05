# Dependency Cruiser And Madge

## What It Is

[dependency-cruiser](https://github.com/sverweij/dependency-cruiser) validates and visualizes JavaScript, TypeScript, CoffeeScript, ES module, CommonJS, and AMD dependencies with project-defined rules. Its docs cover the [CLI](https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md), [rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md), [options reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md), and [output format](https://github.com/sverweij/dependency-cruiser/blob/main/doc/output-format.md).

[Madge](https://github.com/pahen/madge) generates dependency graphs, finds circular dependencies, and exposes basic graph queries for CommonJS, AMD, ES modules, and CSS preprocessors. It delegates extraction/resolution to dependency-tree, filing-cabinet, and precinct.

## Agent-Ergonomics Value

dependency-cruiser is better for agent context. It can emit a full machine-readable dependency model, collapse graphs by folder, focus on neighborhoods, trace affected dependents, and enforce named rules. That gives an agent a stable import map before opening source and a governance layer that explains why a dependency edge is allowed or blocked.

Madge is useful for quick orientation: list dependencies, reverse dependents, or cycles. It is weaker as architectural context because it reports graph facts but does not own boundary intent.

## Output Quality

dependency-cruiser emits `json`, `markdown`, `dot`, `ddot`, `archi`/`cdot`, `flat`/`fdot`, `mermaid`, `d2`, `html`, `err-html`, `csv`, `text`, TeamCity, and Azure DevOps formats. `json` is the best source for `.agent-html/index/imports.md`: stable enough to post-process, diffable after sorting, and rich enough to include resolved paths, dependency types, circularity, and rule violations. `markdown` is useful for CI summaries; `err` is lint-like and exits non-zero on rule errors.

Madge exposes `.obj()`, `.circular()`, `.circularGraph()`, `.depends()`, `.orphans()`, `.leaves()`, `.dot()`, `.image()`, `.svg()`, plus CLI `--json`, `--circular`, `--depends`, `--orphans`, `--leaves`, `--dot`, and `--image`. Its JSON object is readable and diffable, but comparatively thin: good for graph snapshots, less commit-worthy as a canonical index unless wrapped by custom metadata and sorting.

## Fit For `.agent-html/index/`

Adopt.

Use dependency-cruiser as the generator input for `.agent-html/index/imports.md` and as the likely foundation for future dependency boundary checks. It directly supports JS/TS/TSX analysis, `tsConfig` for `baseUrl`/`paths`, webpack resolution aliases, circular rules, folder-level rules, and CI-grade reporter behavior.

Madge should be imitated only for its simple command ergonomics and quick cycle views. It should not be the boundary-governance source of truth because it lacks native architectural rule enforcement.

## Integration Shape

Initial index experiment:

```bash
npx depcruise "packages/**/*.ts" "packages/**/*.tsx" "apps/**/*.ts" "apps/**/*.tsx" --ts-config tsconfig.json --output-type json --output-to .agent-html/index/imports.json
node tools/generate-imports-md.mjs .agent-html/index/imports.json .agent-html/index/imports.md
```

Boundary check experiment:

```bash
npx depcruise --validate --config .dependency-cruiser.mjs --output-type err apps packages
npx depcruise --validate --config .dependency-cruiser.mjs --output-type markdown --output-to .agent-html/index/dependency-boundaries.md apps packages
```

Likely config shape:

```js
export default {
  forbidden: [
    {
      name: "no-circular-runtime",
      severity: "error",
      from: {},
      to: { circular: true, viaOnly: { dependencyTypesNot: ["type-only"] } }
    },
    {
      name: "runtime-not-to-app",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" }
    }
  ],
  options: {
    tsConfig: { fileName: "tsconfig.json" },
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.(test|spec)\\.[tj]sx?$" }
  }
};
```

Madge comparison command:

```bash
npx madge --extensions ts,tsx --ts-config tsconfig.json --json apps packages
npx madge --extensions ts,tsx --ts-config tsconfig.json --circular apps packages
```

## Risks

dependency-cruiser adds a dedicated config surface and can become noisy if rules are introduced before the repo has a clean baseline. Generated markdown can go stale unless it is produced by CI or a scripted index command. Its output is rich enough to create false confidence if unresolved aliases, generated files, or type-only imports are ignored without review.

Madge has lower setup cost but weaker governance. TS/TSX and aliases require explicit `tsConfig`, and mixed JS/TS resolution may require both `webpackConfig` and `tsConfig`. Graphviz is needed for visual outputs. Its simpler JSON can hide important context such as rule intent, dependency type policy, and known-violation handling.

## Recommendation

Adopt dependency-cruiser for the first `.agent-html/index/imports.md` prototype, generated from sorted `json`, then add one low-noise CI rule: fail only on new runtime circular dependencies.
