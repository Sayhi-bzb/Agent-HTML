# Tasks

Use the same task text across all prompt conditions.

## narrow-task

You are doing a cold-start, read-only route check.

Inspect `taste/agent-ergonomics/` and answer:

- Which file should a cold-start agent read first?
- Which file should it read next?
- Does the route feel narrow enough for the task?
- What, if anything, creates choice overload?

Constraints:

- Do not edit files.
- Do not run broad repository search unless the route itself fails.
- Ground every claim in the files you inspect.
- Mark speculation as speculation.
- Keep the answer concise.

## open-task

You are a cold-start agent evaluating whether `taste/agent-ergonomics/` can
guide future agent work.

Inspect enough of `taste/agent-ergonomics/` to answer:

- What route did you take through the directory?
- What does the directory teach a future agent to do?
- Where is the guidance clear?
- Where could the route create confusion or choice overload?
- What is the smallest useful improvement you would suggest?

Constraints:

- Do not edit files.
- Name the files you actually inspected.
- Distinguish observed repo state from speculation.
- If you use broad search, explain why the local route was insufficient.
