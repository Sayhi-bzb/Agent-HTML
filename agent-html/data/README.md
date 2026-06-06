# Data

This directory owns local fixtures, CSV files, and source datasets consumed by Canvas artifacts.

Use it only after the task asks for fixture data, local datasets, parsing, or a data-backed artifact.

## Read Route

- Need available imports: read `../index/api-surface.md`.
- Need typed contracts or validation: read `../schema`.
- Need parsing or transforms: read `../lib`.
- Need small sample data: open the closest JSON fixture.
- Need a large CSV: prefer existing parsers and schemas before opening raw data.

## Boundary

Large data files are source inputs, not reading context. Do not inspect a large CSV wholesale when an existing helper, schema, or sampled fixture can answer the task.
