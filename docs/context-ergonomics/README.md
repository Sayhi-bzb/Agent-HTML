# Context Ergonomics

上下文人体工学把文件系统视为 agent 的工作界面。

它关注的不是目录是否整齐，而是 agent 在一次任务中能否用最少跳转命中正确上下文，避免无关文件进入工作记忆。

## Definition

Context Ergonomics is the practice of shaping project information so agents can route each task to the smallest useful context.

In this repo, it means:

- frequent working files stay shallow and predictable;
- low-frequency or infrastructure files are folded into named domains;
- each directory name acts as a stable context anchor;
- each action should load the narrowest context that can complete the task;
- docs and file layout should reduce context entropy, not merely reduce file count.

## Why It Matters

Agent work is sensitive to context pollution. A broad search, a noisy directory, or a large mixed-purpose file can push the agent toward the wrong abstraction or make it modify the wrong layer.

The file tree should therefore behave like navigation:

- `AGENTS.md` routes the task;
- shallow directories expose the common path;
- deeper directories reveal lower-level implementation only when needed;
- feature boundaries prevent unrelated concerns from entering the same edit.

## Reading Order

- `../diary/context-is-alive.md` establishes the first-person working posture.
- `constitution.md` defines why context shapes agent behavior.
- `principles.md` defines the stable operating principles.
- `practices.md` defines concrete workspace rules.
- `field-notes.md` records project experience and decisions.

`context-ergonomics/` owns the formal model. `diary/` owns lived agent posture.

## Current Application

The `.agent-html` workspace is the first active application of this method.

Artifact work should usually route through:

```text
.agent-html/AGENTS.md
  -> artifacts or examples
  -> ui, hooks, lib, schema, data as needed
  -> styles/content.css only when reusable artifact style classes are needed
  -> styles/internal only when system chrome behavior is requested
  -> styles/tokens only when the token pipeline is being changed
```

The goal is not to hide capability. The goal is progressive disclosure: expose the right layer at the right time.
