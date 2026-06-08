# Style Token Architecture Blueprint

This todo is the construction map for the Canvas style-system reorganization.
It explains the intended architecture so future coders understand why we are
moving files, not just patching token values.

Hard rules still live in `AGENTS.md`, Canvas docs, and boundary tests. When this
blueprint becomes implementation work, update those sources together.

## Goal

We are doing a directory-level cleanup of `agent-html/styles`.

The style system already has a logical pipeline, but the file layout still
reflects incremental history:

- public artifact classes live at `styles/content.css`, next to runtime entry
  files;
- feature token files live directly under `styles/tokens`, mixed with
  foundation and bridge files;
- `internal/*` is correctly an implementation layer, but the public/internal
  split is not visible from the top-level directory;
- boundary tests currently lock the old layout, so moving files requires docs
  and tests to move at the same time.

The target is agent ergonomics: a coder should know the correct edit route from
the path alone.

## Target Architecture

Use this as the desired final shape:

```text
agent-html/styles/
  index.css
    runtime CSS import map only

  base.css
    global base behavior: font import consumption, selection, root defaults

  tokens/
    index.css
      token import map only

    foundation.css
      top-level semantic values:
      background, foreground, primary, secondary, muted, accent,
      destructive, success, warning, info, border, input, ring,
      chart, radius, font, shadow

    tailwind.css
      Tailwind and shadcn token bridge only

    features/
      artifact.css
        artifact reading container tokens

      content.css
        public artifact content scale tokens:
        gaps, panel padding, icon box size, text scale, grid gap

      code-block.css
        CodeBlock implementation tokens, including diff color derivations

      host.css
        host chrome, sidebar, prompt, toolbar, and block chrome tokens

      theme-editor.css
        theme editor control tokens

  public/
    content.css
      artifact-consumable public class API:
      stack, cluster, wrap, grid gap, panel, icon box, text scale

  internal/
    artifact.css
      `.agent-html-artifact` reading container implementation

    code-block.css
      CodeBlock implementation CSS

    host.css
      host chrome implementation CSS

    theme-editor.css
      theme editor implementation CSS
```

Keep `styles/index.css` as the only runtime stylesheet entrypoint. It imports
tokens, base, public classes, and internal implementation CSS in that order.

## Token Pipeline

The clean color and style pipeline is:

```text
foundation semantic tokens
  -> feature tokens derived from foundation
  -> Tailwind bridge only when utility consumption is needed
  -> public classes or internal implementation CSS
  -> React components consume semantic utilities/classes
```

Meaning belongs higher than usage:

- durable semantic meaning belongs in `tokens/foundation.css`;
- feature-specific derivations belong in `tokens/features/<feature>.css`;
- public artifact classes belong in `public/content.css`;
- implementation selectors belong in `internal/*.css`;
- Tailwind mappings belong in `tokens/tailwind.css` and should not tune one
  component.

Example: CodeBlock diff colors should not hardcode red or green in
`internal/code-block.css`. The route is:

```text
--success / --destructive
  -> --canvas-code-block-diff-add / --canvas-code-block-diff-remove
  -> .canvas-code-block .diff.add / .diff.remove
```

## Roadmap

### Phase 1: Rewrite Architecture Intent

Rewrite this blueprint, then update route docs so the target is explicit:

- `agent-html/styles/README.md`;
- `agent-html/styles/tokens/README.md`;
- Canvas design-system docs;
- Canvas workspace/reference docs if they name old style paths.

Docs should describe the target structure, not preserve the old route as the
ideal.

### Phase 2: Move Public Artifact API

Move:

```text
agent-html/styles/content.css
  -> agent-html/styles/public/content.css
```

Then update:

- `agent-html/styles/index.css` import from `./content.css` to
  `./public/content.css`;
- style README route text;
- Canvas docs that identify the public artifact style API;
- boundary tests that currently read `agent-html/styles/content.css`.

This phase makes public artifact classes visibly separate from runtime and
internal layers.

### Phase 3: Move Feature Tokens

Move feature token files under `tokens/features`:

```text
agent-html/styles/tokens/artifact.css
agent-html/styles/tokens/content.css
agent-html/styles/tokens/code-block.css
agent-html/styles/tokens/host.css
agent-html/styles/tokens/theme-editor.css

-> agent-html/styles/tokens/features/*.css
```

Keep these files out of `tokens/foundation.css`. They derive from foundation;
they do not define durable top-level semantics.

Then update:

- `agent-html/styles/tokens/index.css`;
- token README ownership table;
- Canvas docs that name feature token paths;
- boundary tests that read the old paths.

### Phase 4: Update Boundary Tests

Update `packages/cli/src/react-canvas/boundaries.test.mjs` so the test suite
enforces the new architecture:

- allow `agent-html/styles/public`;
- allow `agent-html/styles/tokens/features`;
- keep rejecting unrelated buckets such as `styles/system`, `styles/use`, and
  `styles/bridge`;
- assert `styles/index.css` imports the new public and feature-token paths;
- assert feature tokens still consume foundation semantics instead of raw
  palette classes.

The test should protect the intended layers, not the old directory names.

### Phase 5: Raw Color Audit

After files move, audit usage paths:

- artifacts and examples should consume semantic utilities or public classes;
- rich components should consume semantic utilities, local class names, or
  feature tokens;
- host CSS should consume host feature tokens;
- raw palette utility classes such as `bg-zinc-*`, `text-red-*`,
  `border-blue-*`, and one-off arbitrary color values should not appear in
  artifact or rich-component surfaces.

If a durable visual meaning is missing, add it to foundation first. If the
meaning is feature-only, derive it in `tokens/features/<feature>.css`.

### Phase 6: Verification

Run:

```text
npm run react-canvas:typecheck
npm run react-canvas:guard
npm test -- --run packages/cli/src/react-canvas/boundaries.test.mjs
gitnexus_detect_changes({ scope: "all" })
```

If boundary tests fail for unrelated existing workspace state, record that
separately and keep the style-token failure signal clear.

## Construction Rules

- Do not leave public artifact classes at the top level after Phase 2.
- Do not leave feature token files directly under `tokens` after Phase 3,
  except `foundation.css`, `tailwind.css`, and `index.css`.
- Do not put component-specific tokens into `tokens/features/content.css`.
- Do not put long-lived semantic color decisions into `internal/*.css`.
- Do not change `tokens/tailwind.css` to tune one component or one artifact.
- Do not use raw palette classes to bypass the token pipeline.
- Do not add new directories unless the layer has a clear routing job.
- Do not treat this todo as law after implementation; promote stable rules into
  docs and boundary tests.

## Acceptance Criteria

The blueprint target is complete when:

- `styles/public/content.css` owns the public artifact class API;
- `styles/tokens/features/*` owns feature token derivations;
- `styles/tokens/foundation.css` owns top-level semantic values;
- `styles/tokens/tailwind.css` is only the Tailwind/shadcn bridge;
- `styles/internal/*` consumes tokens and owns implementation selectors;
- docs and boundary tests name the new routes;
- raw color usage remains blocked across artifact, rich-component, and host
  surfaces.
