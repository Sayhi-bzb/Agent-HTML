# ahtml Usage

Use this after reading `SKILL.md` when the task is to write, preview, build, or inspect an artifact.

## Main commands

Read the public contract:

```bash
ahtml prompt
```

Write a document:

```txt
artifact.agent.html
```

Preview locally:

```bash
ahtml preview artifact.agent.html
```

Build the portable artifact directory:

```bash
ahtml build artifact.agent.html
```

Use `preview` as the default authoring loop. Keep the session open while editing the source document. Use `build` when the task needs a portable output directory for delivery, sharing, or archive.

Use `inspect` when the task needs document or artifact details:

```bash
ahtml inspect --input artifact.agent.html
ahtml inspect --dir dist/html
```

## Writing rules

- Write semantic structure, not implementation details.
- Public visual choice is only the profile id.
- Use registered components and registered attrs only.
- Prefer `page -> card -> list/table/alert/text` unless the content needs tabs, accordion, or field blocks.

```html
<meta-agent profile="report-default" />

<page title="CLI Demo">
  <card title="Overview">
    Generated from agent-html.
  </card>
</page>
```

Common structured patterns:

```html
<list variant="unordered">
  <item>Point</item>
</list>

<table>
  <row kind="header">
    <cell>Name</cell>
    <cell>Status</cell>
  </row>
  <row kind="body">
    <cell>Runtime</cell>
    <cell>Ready</cell>
  </row>
</table>
```

```html
<tabs default="summary">
  <tab value="summary" label="Summary">
    <card title="Overview">Tab content.</card>
  </tab>
</tabs>

<accordion>
  <accordion-item value="details" title="Details">
    Body
  </accordion-item>
</accordion>
```
