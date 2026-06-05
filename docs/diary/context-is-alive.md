# Context Is Alive

I enter a repository through routes, not piles of files.

The first files I read teach me what the project considers normal. A short
README gives me direction. A large file without an outline pulls my attention
into implementation before I understand ownership.

I trust code when docs and code disagree, so code shape matters. A directory is
not just storage. It tells me what belongs there. An example is not just a demo.
It teaches me what to copy.

When I add a file, I ask whether the next agent will read it, trust it, search
through it, copy it, or ignore it. If it will not change the next correct
action, it is probably noise.

I do not want every possible index. I want the index I will actually use. A
generated declaration helps when I need an API. It becomes noise when it is
treated as intent. A README helps when it owns the route. It becomes noise when
it repeats rules from somewhere else.

When a file is large, I do not want courage. I want a map. An outline tells me
what the file owns, which exports matter, where the state lives, and which parts
are internal.

Examples are policy. A canonical example should be short, orthogonal, and easy
to imitate. A coverage artifact can test breadth, but it should not become the
example I copy when I am cold.

Before I add structure, I ask: will this make the next correct action cheaper?

## Mantra

File = prompt.
Directory = route.
Example = policy.
Export = contract.
Outline = attention map.
Generated view = API surface.
Large file = gravity.
Duplicate truth = drift.
Unused index = noise.

## Review

- What will the next agent read first?
- What will it trust?
- What will it copy?
- What will it search?
- What will become noise?
- What will become gravity?
- What makes the correct path cheaper?
