# Context Ergonomics

上下文人体工学把工作上下文视为 agent 的行为环境。

它关注的不是目录是否整齐，而是 agent 在一次任务中能否用最少跳转命中正确上下文，避免无关文件进入工作记忆。

## Definition

Context Ergonomics is the practice of shaping working context so agents can route each task to the smallest useful context.

In practice, it means:

- frequent working files stay shallow and predictable;
- low-frequency or infrastructure files are folded into named domains;
- each directory name acts as a stable context anchor;
- each action loads the narrowest context that can complete the task;
- docs and layout reduce context entropy, not merely file count.

## Premise

上下文人体工学建立在一个前提上：agent 的上下文是有限的，而且上下文不是中性的输入。

Agent 不是在稳定理解整个项目后再行动。它是在有限窗口中读取文件、示例、规则、命名和近期消息，再基于这些信号推断当前任务的正常路径。进入窗口的任何内容都会参与塑造它的判断。

因此，上下文设计不是文档整理问题。它是行为环境设计。

## Context as Behavioral Environment

文件系统、文档入口、示例代码、目录名和搜索结果共同构成 agent 的工作环境。

一个好的环境会让 agent 快速判断：

- 从哪里开始；
- 哪个文件是当前任务的来源；
- 哪个层拥有当前行为；
- 哪些资源应该复用；
- 哪些上下文这次不应该打开。

一个差的环境会迫使 agent 广泛搜索。广泛搜索会把无关层、旧实现、临时代码和错误案例带入工作记忆，使它更容易修改错误抽象或错误边界。

Agent 不仅读取显式规则，也会吸收上下文中的模式。高权重信号包括最近打开的文件、多次重复出现的结构、具体可复制的示例、看起来像官方入口的文件，以及与当前任务词汇相似但层级不同的实现。

这意味着一个丑陋案例、一个临时 workaround、一个过时 demo，或一个混杂多层职责的大文件，都可能被 agent 当成项目惯例继续复制。

## High-Weight Signals

Context behavior is shaped by a few recurring signal types:

- **Context Route**: the first visible path tells the agent where the task
  belongs.
- **Constraint Level**: hard rules, defaults, practices, heuristics, and smells
  should not sound equally strict.
- **Document Role**: a README, AGENTS file, guide, API surface, example, and
  generated index should not answer the same question.
- **Normative Example**: examples, fixtures, and demos are copyable behavior
  seeds.
- **Route Check**: route scripts verify whether the intended path is cheaper
  than broad search.

## Principles

- Workspace as Interface: workspace is not just storage. It is the interface agents use to understand, edit, and verify the project.
- Context Route: each task should have an obvious first context anchor. When a task has no obvious anchor, broad search becomes the default.
- Progressive Disclosure: common paths stay shallow. Specialized paths sit behind clear domain names.
- Noise Budget: every file opened spends attention. Split files when the split improves task routing, not merely because a file is large.
- Anchor Precision: a context anchor is precise when an agent can infer what it owns before opening it.
- Layer Respect: agent work should touch the layer requested by the task.

## Practices

- Make the first hop obvious through a shallow route file.
- Keep frequent files shallow and predictable.
- Fold low-frequency infrastructure into clear named domains.
- Split by task route rather than by technology category alone.
- Keep entry files as maps, not mixed-purpose knowledge dumps.
- Preserve stable vocabulary across files, directories, docs, and examples.
- Write boundaries as operational rules an agent can obey during an edit.

## Non-Claim

This document does not claim that one directory structure, file split, or naming rule is always correct.

It defines an evaluation standard: a context design should help agents reduce noise, hit the correct layer, reuse the correct resources, and prevent bad examples or unrelated implementations from steering behavior.
