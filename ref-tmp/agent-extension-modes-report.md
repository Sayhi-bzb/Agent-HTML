# Hooks、MCP、Skills、Plugins 的区别

这份报告把 Claude Code 里的 hooks、MCP、skills、plugins 当作四种“agent 与外界连接/扩展”的模式来比较：它们分别解决什么问题、什么时候用、和 agent 的接口边界是什么。

## 总览

这四者都能扩展 agent，但层级不同。

| 机制 | 本质 | 谁主动调用谁 | 适合做什么 | 接口/协议形态 |
| --- | --- | --- | --- | --- |
| Hooks | 生命周期事件回调 | Claude Code 在固定事件点触发外部逻辑 | 自动化、拦截、校验、通知、审计 | settings JSON；事件输入/输出 JSON；command hook 用 stdin/stdout/exit code；HTTP hook 用 POST/response JSON |
| MCP | 标准化工具协议 | Agent 调用外部 MCP server 暴露的能力 | API、数据库、SaaS、内部系统、工具集成 | JSON-RPC 2.0 语义，常见 transport 是 stdio、streamable HTTP，旧版还有 SSE |
| Skills | 可复用说明书/工作流 | Agent 加载 skill，或用户用 `/skill-name` 调用 | 流程、清单、项目规范、领域知识、可执行 recipe | `SKILL.md` 目录格式，YAML frontmatter + Markdown 正文 |
| Plugins | 打包和分发容器 | Claude Code 安装并加载插件内容 | 分发 skills、hooks、MCP servers、agents、LSP 配置 | 插件 manifest 和目录结构；本身不是 agent RPC 协议 |

一句话：

- **Hooks**：当某个事件发生时，自动执行某段逻辑。
- **MCP**：给 agent 提供可调用的外部工具。
- **Skills**：教 agent 按某套流程或规范做事。
- **Plugins**：把上述能力打包、安装、分发。

## Hooks

Hooks 是 Claude Code 生命周期里的事件回调。它可以在 Claude Code 的特定节点运行 shell 命令、HTTP endpoint、prompt hook、agent hook 或 MCP tool hook。例如工具调用前、工具调用后、Claude 等待输入时、Claude 准备结束任务时。

Hooks 的重点是“确定性控制”。也就是说，它适合那些必须发生、不应该依赖模型是否记得做的事情。

典型场景：

- Claude 等待用户输入时发桌面通知。
- 文件编辑后自动格式化。
- 阻止修改受保护文件。
- Bash 命令执行前做危险命令校验。
- 上下文压缩后重新注入必要信息。
- 审计工具调用或配置变更。
- Claude 停止前先跑测试或检查。

接口形态：

- 在 Claude Code 的 settings JSON 里配置 `hooks`。
- 每个 hook 绑定到事件名，例如 `Notification`、`PreToolUse`、`PostToolUse`、`Stop`。
- `matcher` 用来过滤具体触发条件，比如只匹配某些工具。
- command hook 通过 stdin 接收事件 JSON，通过 stdout、stderr 和 exit code 返回结果。
- HTTP hook 通过 POST 接收同样的事件 JSON，通过 HTTP response body 返回 JSON。
- 是否阻止动作，主要由 hook 输出 JSON 里的字段决定，不是单纯靠 HTTP status code。

所以 hooks 更像“围绕 agent 的自动化和策略层”，不是 agent 自己主动选择调用的一组工具。

## MCP

MCP，全称 Model Context Protocol，是把 Claude Code 连接到外部工具、数据库、API 和服务的标准协议。MCP server 可以向 agent 暴露 tools、resources 和 prompts，Claude 可以发现并调用这些能力。

MCP 最适合“agent 需要实时访问另一个系统”的情况。

典型场景：

- 读取 Jira issue，然后实现里面描述的功能。
- 查询 PostgreSQL 或其他数据库。
- 从 Sentry、监控系统、分析系统里拉数据。
- 访问 Figma、Notion、Slack、GitHub、GitLab、Asana 等服务。
- 把公司内部 API 暴露成 agent 可调用工具。
- 提供 MCP prompts，让它们在 Claude Code 里表现为 slash commands。

接口形态：

- MCP 是协议级集成，消息模型接近 JSON-RPC 2.0。
- 常见 transport 有本地 stdio server 和远程 streamable HTTP server。
- SSE 是较老的 transport，文档里已建议优先用 HTTP。
- MCP server 会声明自己提供哪些 tools、prompts、resources。
- Claude Code 支持 `list_changed` 通知，让 MCP server 动态更新可用能力。
- stdio server 适合本地进程和本机能力；HTTP server 更适合远程或云服务。

所以 MCP 可以理解成：“把外部系统变成 agent 可以调用的工具集”。

## Skills

Skills 是可复用的说明书和工作流。一个 skill 是一个目录，核心入口是 `SKILL.md`。这个文件包含 YAML frontmatter 和 Markdown 指令。Claude Code 可以在相关场景自动加载 skill，用户也可以用 `/skill-name` 手动调用。

Skills 本质上不是 RPC，也不是服务。它是把流程、规范、上下文和可执行 recipe 加载到 agent 的工作上下文里。

典型场景：

- 固化一套代码 review 清单。
- 保存项目专用的发布流程。
- 教 Claude 如何 build、run、verify 一个特殊项目。
- 提供写作、代码生成、格式化、测试等规范。
- 搭配脚本、模板、示例输出、参考资料一起使用。
- 用 `context: fork` 让某个 skill 在 subagent 里隔离执行。

接口形态：

- 目录约定：`.claude/skills/<skill-name>/SKILL.md`、`~/.claude/skills/<skill-name>/SKILL.md`，也可以由 plugin 提供。
- YAML frontmatter 控制 metadata，例如 `description`、是否允许模型自动调用、allowed tools、是否 fork 到 subagent 等。
- Markdown 正文提供实际操作说明。
- dynamic context injection 可以在 Claude 看到 skill 内容前先执行 shell 命令，并把命令输出替换进 skill 内容。
- skill 目录可以包含脚本、模板、示例、参考文档等支持文件。

所以 skills 可以理解成：“教 agent 做某类任务的方法”。

## Plugins

Plugins 是打包和分发单位。一个 plugin 可以包含 skills、agents、hooks、MCP server 配置、LSP 集成和其他资源。plugin marketplace 则是发现和安装这些包的目录。

Plugins 不是一种单独的 agent-外部系统通信协议。它解决的是安装、分发、版本、团队共享的问题。

典型场景：

- 安装 GitHub、Figma、Sentry、Slack、Notion、Jira 等现成集成。
- 给团队共享一组 skills 和 agents。
- 把 MCP 配置打包，避免用户手工配置 server。
- 通过语言服务器插件给 Claude 增加代码智能能力。
- 发布公司内部 Claude Code 工具箱。

接口形态：

- 通过 `/plugin` 命令或 marketplace 配置安装。
- marketplace 提供插件目录。
- 安装后的插件文件会进入 plugin cache。
- 插件里的内容按自身类型加载：skill 按 skill 加载，hook 按 hook 加载，MCP server 按 MCP server 加载。

所以 plugins 可以理解成：“把扩展能力打包给别人安装”。

## 怎么选

如果触发点是 Claude Code 生命周期事件，并且动作应该自动发生，用 **hooks**。

例子：

- “每次 Bash 命令执行前检查危险模式。”
- “每次编辑文件后自动格式化。”
- “Claude 停止前必须确认测试通过。”

如果 agent 需要调用外部系统，用 **MCP**。

例子：

- “让 Claude 查询我们的数据库。”
- “让 Claude 创建 GitHub issue。”
- “让 Claude 获取监控数据。”

如果 agent 需要一套可复用的流程、知识或操作规范，用 **skills**。

例子：

- “PR review 永远按这套清单检查。”
- “发布流程按这个步骤执行。”
- “这个 repo 的验证方式比较特殊，按这份 recipe 来。”

如果你要把能力分发给别人，或者把多种能力打成一个包，用 **plugins**。

例子：

- “把内部 MCP server 和 setup skill 打包。”
- “发布公司统一的 review toolkit。”
- “从 marketplace 安装 GitHub 集成。”

## 层级关系

Plugin 可以包含其他几类机制：

```text
Plugin
  ├─ Skills: 指令、流程、工作方式
  ├─ Hooks: 生命周期自动化和策略控制
  ├─ MCP servers: 可调用的外部工具、资源、prompt
  ├─ Agents: 专用执行上下文
  └─ LSP/config/assets: 支持性集成文件
```

因此，plugin 是分发层；hooks、MCP、skills 才是运行时行为层。

## 协议对比

| 机制 | 是不是 RPC | 主要边界 | 结构化输入/输出 |
| --- | --- | --- | --- |
| Hooks | 通常不是 RPC，更像事件回调 | Claude Code 事件到 command/HTTP/MCP hook | 是。事件 JSON 和 hook 输出 JSON；command hook 还用 stdout/stderr/exit code |
| MCP | 是，协议级 RPC 模型 | Agent client 到 MCP server | 是。JSON-RPC 2.0 风格消息 |
| Skills | 不是 | Markdown 指令加载到 agent 上下文 | YAML frontmatter + Markdown；可选命令替换输出 |
| Plugins | 不是 | 插件安装和加载边界 | manifest/config 文件；内部机制各自定义接口 |

## 最实用的记忆方式

- **Hooks**：发生某事时，自动跑某逻辑。
- **MCP**：这里有一批工具，agent 可以调用。
- **Skills**：遇到这类任务时，agent 应该这样做。
- **Plugins**：把这些能力打包，让别人安装。

