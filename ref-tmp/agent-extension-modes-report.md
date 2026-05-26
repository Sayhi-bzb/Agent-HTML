# Hooks, MCP, Skills, and Plugins

This report summarizes four Claude Code extension mechanisms as connection patterns between an agent and external capabilities.

## Executive Summary

Hooks, MCP, skills, and plugins all extend what an agent can do, but they operate at different layers.

| Mechanism | Core role | Call direction | Best for | Interface shape |
| --- | --- | --- | --- | --- |
| Hooks | Lifecycle event callbacks | Claude Code triggers external logic at fixed events | Automation, guardrails, validation, notifications, auditing | Settings JSON; event JSON input/output; command hooks use stdin/stdout/exit codes; HTTP hooks use POST/response JSON |
| MCP | Standard tool protocol | Agent calls external server capabilities | APIs, databases, SaaS tools, internal systems | JSON-RPC 2.0 message model over stdio, streamable HTTP, or older SSE |
| Skills | Reusable instructions and workflows | Agent loads instructions, or user invokes `/skill-name` | Procedures, checklists, project workflows, domain guidance | `SKILL.md` directory format with YAML frontmatter and Markdown content |
| Plugins | Packaging and distribution | Claude Code installs and loads bundled extensions | Sharing skills, hooks, MCP servers, agents, LSP config | Plugin manifest and directory/package structure; not itself an agent RPC protocol |

Short version:

- Use hooks when something must happen automatically around Claude Code events.
- Use MCP when Claude needs callable tools or data from another system.
- Use skills when Claude needs a reusable procedure or domain-specific operating guide.
- Use plugins when you want to package and distribute one or more of those capabilities.

## Hooks

Hooks are event-driven callbacks in Claude Code's lifecycle. They are user-defined shell commands, HTTP endpoints, prompt hooks, agent hooks, or MCP tool hooks that run at specific points such as before tool use, after tool use, when Claude needs input, or when Claude is about to stop.

Hooks are deterministic control points. They are appropriate when the behavior should not depend on whether the model remembers or chooses to run something.

Typical use cases:

- Send a desktop notification when Claude Code is waiting for user input.
- Auto-format files after edits.
- Block edits to protected files.
- Validate Bash commands before execution.
- Re-inject context after compaction.
- Audit tool usage or configuration changes.
- Run tests before allowing a task to stop.

Interface shape:

- Configured in Claude Code settings JSON under a `hooks` object.
- Each hook is attached to an event name such as `Notification`, `PreToolUse`, `PostToolUse`, or `Stop`.
- Matchers filter which tool or event payload should trigger the hook.
- Command hooks receive event JSON on stdin and communicate through stdout, stderr, and exit codes.
- HTTP hooks receive the same event JSON via POST and return a JSON response body.
- Blocking behavior is expressed through hook output fields, not merely HTTP status codes.

Hooks are best thought of as policy and automation around the agent, not as general purpose tools the agent voluntarily calls.

## MCP

MCP, the Model Context Protocol, is the standard protocol for connecting Claude Code to external tools, databases, APIs, and services. An MCP server exposes capabilities such as tools, resources, and prompts. Claude can discover those capabilities and call them during work.

MCP is the strongest fit when the agent needs live access to another system.

Typical use cases:

- Read a Jira issue and implement the described feature.
- Query PostgreSQL or another database.
- Pull monitoring data from Sentry or analytics systems.
- Read Figma, Notion, Slack, GitHub, GitLab, Asana, or similar services.
- Expose an internal API as agent-callable tools.
- Provide MCP prompts that show up as Claude Code slash commands.

Interface shape:

- MCP is protocol-level integration, using a JSON-RPC 2.0 style message model.
- Common transports include local stdio servers and remote streamable HTTP servers.
- SSE appears in older integrations but is deprecated in favor of HTTP where available.
- Servers advertise tools, prompts, and resources.
- Claude Code can dynamically refresh MCP capabilities through `list_changed` notifications.
- Stdio servers run as local processes; HTTP servers are usually preferred for remote/cloud systems.

MCP is best thought of as "make this external system available as agent tools."

## Skills

Skills are reusable instructions and workflows. A skill is a directory whose required entrypoint is `SKILL.md`. The file contains YAML frontmatter plus Markdown instructions. Claude Code can load a skill automatically when relevant, or the user can invoke it directly with `/skill-name`.

Skills do not primarily expose an RPC endpoint. They extend the agent's working context and behavior.

Typical use cases:

- Capture a repeated review checklist.
- Store a project-specific release process.
- Teach Claude how to build, run, or verify an unusual project.
- Provide formatting, writing, or code-generation conventions.
- Bundle scripts, examples, templates, or reference material with instructions.
- Run a skill in a subagent using `context: fork`.

Interface shape:

- File/directory convention: `.claude/skills/<skill-name>/SKILL.md`, `~/.claude/skills/<skill-name>/SKILL.md`, or plugin-provided skills.
- YAML frontmatter controls metadata such as `description`, invocation behavior, allowed tools, and subagent context.
- Markdown body supplies the actual instructions.
- Dynamic context injection can run shell commands before Claude sees the skill content, replacing placeholders with command output.
- Skills can include supporting files such as scripts, templates, examples, and references.

Skills are best thought of as "teach the agent how to do this kind of task."

## Plugins

Plugins are packaging and distribution units. A plugin can contain skills, agents, hooks, MCP server configuration, LSP integration, and related assets. Plugin marketplaces are catalogs for discovering and installing those packages.

Plugins are not a separate runtime interaction protocol between the agent and an external system. They are a delivery mechanism for other extension types.

Typical use cases:

- Install a prebuilt GitHub, Figma, Sentry, Slack, Notion, or Jira integration.
- Share team-specific skills and agents.
- Bundle MCP configuration so users do not configure servers manually.
- Add code intelligence through language-server plugins.
- Publish an internal Claude Code toolkit through a marketplace.

Interface shape:

- Installed through `/plugin` commands or marketplace configuration.
- Marketplaces expose plugin catalogs.
- Installed plugin files are copied into a plugin cache.
- Plugin contents are loaded by Claude Code according to their type: skills as skills, hooks as hooks, MCP servers as MCP servers, and so on.

Plugins are best thought of as "package and distribute extension capabilities."

## Choosing Between Them

Use hooks when the trigger is a Claude Code lifecycle event and the action should happen automatically.

Examples:

- "Before any Bash command, block dangerous shell patterns."
- "After editing a file, run formatter."
- "When Claude stops, verify tests pass."

Use MCP when the agent needs to call an external system as a tool.

Examples:

- "Let Claude query our database."
- "Let Claude create GitHub issues."
- "Let Claude fetch monitoring data."

Use skills when the agent needs reusable knowledge, procedure, or workflow guidance.

Examples:

- "Always review PRs using this checklist."
- "Use this deployment procedure."
- "Follow this repo-specific verification workflow."

Use plugins when you need to distribute or install a bundle of capabilities.

Examples:

- "Package our internal MCP server plus setup skill."
- "Ship a company review toolkit."
- "Install a marketplace plugin for GitHub integration."

## Relationship Model

Plugins can contain the other mechanisms:

```text
Plugin
  ├─ Skills: instructions and workflows
  ├─ Hooks: lifecycle automation and policy
  ├─ MCP servers: callable external tools/resources/prompts
  ├─ Agents: specialized execution contexts
  └─ LSP/config/assets: supporting integration files
```

This makes plugin the distribution layer, while hooks, MCP, and skills are runtime behavior layers.

## Protocol Comparison

| Mechanism | Is it RPC? | Main data boundary | Structured input/output |
| --- | --- | --- | --- |
| Hooks | Not generally; event callback model | Claude Code event to command/HTTP/MCP hook | Yes, event JSON and hook output JSON, plus stdout/stderr/exit codes for command hooks |
| MCP | Yes, protocol-level RPC model | Agent client to MCP server | Yes, JSON-RPC 2.0 style messages |
| Skills | No | Markdown instructions loaded into agent context | YAML frontmatter plus Markdown; optional command substitution output |
| Plugins | No | Package installation/loading boundary | Manifest/config files; contained mechanisms define their own interfaces |

## Practical Mental Model

- Hooks: "When this happens, run this."
- MCP: "Here are tools the agent can call."
- Skills: "Here is how the agent should do this."
- Plugins: "Here is a bundle users can install."

