# TypeScript API Surface Tools

## What It Is
TypeScript declaration emit is the compiler-native baseline: `declaration` generates `.d.ts` files that describe module API, `emitDeclarationOnly` emits only declarations, and `declarationDir` controls their output folder. Sources: [declaration](https://www.typescriptlang.org/tsconfig/declaration.html), [emitDeclarationOnly](https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html), [declarationDir](https://www.typescriptlang.org/tsconfig/declarationDir.html).

[API Extractor](https://api-extractor.com/) is Microsoft/Rush Stack's API review and declaration rollup tool. It can generate a tracked Markdown API report, roll up `.d.ts` into a package declaration file, trim by release tags, and emit an intermediate API doc model JSON. Sources: [API report](https://api-extractor.com/pages/overview/demo_api_report/), [.d.ts rollup](https://api-extractor.com/pages/overview/demo_rollup/), [doc model](https://api-extractor.com/pages/setup/generating_docs/), [GitHub](https://github.com/microsoft/rushstack).

[TypeDoc](https://typedoc.org/) is a TypeScript documentation generator. It reads TypeScript entry points, renders HTML by default, and can emit JSON reflection data. Sources: [overview](https://typedoc.org/documents/Overview.html), [input options](https://typedoc.org/documents/Options.Input.html), [output options](https://typedoc.org/documents/Options.Output.html), [GitHub](https://github.com/TypeStrong/typedoc).

## Agent-Ergonomics Value
Declaration emit helps agents skip implementation files when the question is "what is exported?" It is cheap, compiler-accurate, and works with sparse JSDoc, but it preserves source module shape and does not summarize architecture.

API Extractor helps agents read one review artifact before opening source. The `.api.md` report exposes exported signatures, release tags, and undocumented API markers without bodies. The rolled-up `.d.ts` is useful when the intended surface is one entry point. The JSON doc model is valuable if a later indexer wants structured symbols plus docs.

TypeDoc helps when agents need navigable API documentation, grouped symbols, source links, and JSON reflection data. It is more documentation-oriented than contract-oriented, so its value depends heavily on meaningful comments and careful entry point selection.

## Output Quality
Declaration emit is stable, diffable, and commit-worthy when generated into a dedicated folder. It is readable enough for agents when exports are explicit and components use named prop types. It is less readable for complex React component declarations, inferred generics, re-export chains, and shadcn-style files that mix component code, variants, local helpers, and exported constants.

API Extractor has the best review artifact. Its API report is designed for Git tracking and meaningful diffs, while the declaration rollup can produce a single consumer-facing `.d.ts`. It also flags undocumented exports and release-tag issues. The cost is configuration strictness: packages with multiple entry points, loose exports, path aliases, or incidental component exports need cleanup before the output stays quiet.

TypeDoc output is readable as a website and its JSON is useful for tools, but the default HTML is usually too heavy to commit for an internal agent index. JSON is commit-worthy only if normalized and consumed by a stable pipeline. Without JSDoc, TypeDoc still shows signatures, but it does not add much architectural context beyond what declarations already provide.

## Fit For `.agent-html/index/`
Imitate.

Use TypeScript declaration emit as the v1 source of truth and imitate API Extractor's concise report shape in any agent-facing index. Defer full API Extractor or TypeDoc adoption until the index needs enforced public-contract review, declaration rollup, or structured doc JSON.

## Integration Shape
V1 declaration emit:

```json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationDir": ".agent-html/index/types"
  },
  "include": ["packages/**/*.ts", "packages/**/*.tsx", "apps/**/*.ts", "apps/**/*.tsx"]
}
```

Test API Extractor for one package with a single entry point:

```powershell
npm install --save-dev @microsoft/api-extractor
npx api-extractor init
npx api-extractor run --local
```

Expected outputs to evaluate:

```text
etc/<package>.api.md
dist/<package>.d.ts
temp/<package>.api.json
```

Test TypeDoc only as a JSON experiment:

```powershell
npm install --save-dev typedoc
npx typedoc --entryPoints packages/ahtml/src/index.ts --json .agent-html/index/typedoc.json --emit docs
```

## Risks
Declaration emit can create false confidence because it shows type shape, not intended architecture. It may expose incidental exports from shadcn-style component files and may be noisy if generated paths mirror too much source structure.

API Extractor adds dependency weight, config maintenance, release-tag policy, and likely cleanup work around path aliases and multiple entry points. Its rollup is strongest for package-style APIs, not broad app trees.

TypeDoc can produce large output, stale generated docs, and comment-driven gaps. Its JSON model is rich but not automatically agent-readable unless reduced into a smaller index. HTML output is useful for humans but usually too bulky for committed agent context.

## Recommendation
Use TypeScript declaration emit for v1, then add a small generated Markdown summary that imitates API Extractor's report style. Revisit API Extractor after `.agent-html/index/` has a stable entry-point map and real API-review pain.
