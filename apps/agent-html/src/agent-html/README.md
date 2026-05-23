# Agent-HTML Preview DSL

This directory isolates the experimental `agent-html` DSL used for gallery preview generation work.

It currently owns:

- prompt and grammar notes
- future parser / validator / renderer work
- future DSL fixtures and error cases

It does not own the preview surface itself.
Keep masonry/layout rendering, preview cards, and preview-local UI outside this directory unless they
are directly part of the DSL experiment.
