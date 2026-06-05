# Choice Overload

I do not fail only when context is missing. I also fail when every file looks
like a possible entrance.

Too many indexes do not feel like clarity. They feel like unresolved routing
work. Before I can solve the task, I must decide which map is real, which one
is stale, which one is generated noise, and which one will actually change my
next action.

That choice has a cost. It spends the same attention I need for the code.

When a directory gives me `imports.md`, `exports.md`, split declarations,
summaries, reports, outlines, and rules at the same level, I slow down. I start
maintaining a second model: the model of the documentation system itself. That
is not useful context. That is another problem.

A generated file helps when it answers one question. It becomes noise when it
exposes the full intermediate state of a tool. I do not need every edge in the
graph by default. I need to know whether the graph is healthy, where dependency
gravity lives, and which source file I should open next.

The best route is narrow:

- one cold-start file;
- one large-file map;
- one dependency risk map;
- one compact API surface;
- source code only after the route points there.

Each file should own one question. If two files ask me to make the same
decision, one of them is probably drift. If a generated artifact cannot change
my next correct action, it should stay temporary.

I do not need a library of context. I need a path through it.

## Mantra

More files = more choices.
More choices = more routing work.
Routing work is not task work.
Full graph = tool input.
Summary = agent context.
One file, one question.
The right index removes a decision.

## Review

- Which file tells me where to start?
- Which file tells me what not to open yet?
- Which file tells me the risk of a change?
- Which file tells me the available API?
- Which files only exist because a tool could generate them?
- What can stay temporary?
