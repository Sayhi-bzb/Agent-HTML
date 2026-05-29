# App Language

Agent-HTML app language support is intentionally lightweight. The goal is to
make product chrome translatable without turning every feature change into a
translation task.

## Boundary

Lingui is used for app UI chrome under `apps/agent-html-app`.

Do translate:

- navigation and settings labels
- dialogs, buttons, menus, tooltips, and empty states
- stable product-facing status text

Do not translate:

- Agent-HTML runtime artifact content
- generated artifact text
- project names, section titles, and other user-authored content
- code, logs, debug payloads, and fixture source
- the example website locale flow

## Developer Workflow

Feature work should not be blocked by language upkeep. Write clear English UI
copy first. If the text is stable product chrome, wrap it with Lingui while you
are in the file:

- Use `<Trans>` from `@lingui/react/macro` for visible JSX text.
- Use `useLingui().t` for attributes, titles, alerts, and conditional strings.
- Keep message text plain and specific. Avoid clever copy that is hard to
  translate.
- Language controls should show both the saved preference and the resolved
  locale when `System` is selected.

It is acceptable for a feature PR to add English source text before Chinese is
polished. Translation maintenance can happen in a focused pass.

## Maintenance Workflow

When doing a language pass:

```bash
npm run i18n:extract
npm run i18n:compile
```

Edit `.po` files for translations. Do not hand-edit compiled `.mjs` catalogs.
`npm run i18n:compile` must keep ES module output so Vite can import catalogs.

The current extraction scope is intentionally narrow while nearby app work is in
flight. Expand `config/lingui.config.ts` by folder when that area is parse-stable
and ready for i18n cleanup.

## Release Check

Before a release that cares about Chinese polish, run extraction and review the
missing count. Missing translations are a product-quality signal, not a default
CI blocker.

Default checks should stay focused:

```bash
npm run typecheck
npm test
```
