use std::path::Path;

use super::WorkspaceResult;

pub(super) fn root_instructions_content() -> String {
    [
        "# AgentHTML World",
        "",
        "This directory is the AgentHTML workspace root.",
        "",
        "- User projects live under `projects/`.",
        "- Each project lives at `projects/{project-id}/`.",
        "- Each section lives directly under its project directory.",
        "- The canonical artifact for a section is `artifact.agent-html`.",
        "- Projects and sections may define local `AGENTS.md` files for scoped instructions.",
        "- Edit `projects/{project-id}/{section-id}/artifact.agent-html` when changing user-facing workspace content.",
        "- Use workspace-root-relative paths for workspace files; read the AgentHTML skill at `.agents/skills/agent-html/SKILL.md`.",
        "- Use the `$agent-html` skill for `.agent-html`, artifact, block, component, or section work.",
        "- The `agent-html` skill is the Codex bridge for the current AgentHTML runtime contract.",
        "- Do not edit `.agent-world/` unless the task explicitly asks for workspace internals.",
        "",
    ]
    .join("\n")
}

pub(super) fn agent_html_skill_content() -> String {
    [
        "---",
        "name: agent-html",
        "description: Use when editing AgentHTML artifacts, .agent-html files, Gallery Preview DSL, blocks, components, sections, prompt schema, or runtime-rendered artifact content. Before editing AgentHTML content, read `.agents/skills/agent-html/references/prompt-schema.md` for the current DSL contract and enabled component grammar.",
        "---",
        "",
        "# AgentHTML",
        "",
        "This skill is the Codex bridge for the AgentHTML runtime contract.",
        "",
        "Before editing AgentHTML content:",
        "",
        "1. Read `.agents/skills/agent-html/references/prompt-schema.md`.",
        "2. Reuse patterns from `.agents/skills/agent-html/references/examples.md` before inventing structure.",
        "3. Use `.agents/skills/agent-html/scripts/search_icons.py \"<query>\"` before choosing Lucide icon names.",
        "4. Use only tags, attributes, and child rules listed in the prompt schema.",
        "5. Edit `projects/{project-id}/{section-id}/artifact.agent-html` for user-facing workspace content.",
        "",
        "Do not use raw HTML, JSX expressions, imports, hooks, `class`, `className`, or `style` unless the schema explicitly allows them.",
        "",
    ]
    .join("\n")
}

pub(super) struct AgentHtmlSkillResource {
    pub(super) relative_path: &'static str,
    pub(super) content: &'static str,
    pub(super) is_managed: fn(&str) -> bool,
}

pub(super) fn agent_html_skill_resources() -> Vec<AgentHtmlSkillResource> {
    vec![
        AgentHtmlSkillResource {
            relative_path: "references/examples.md",
            content: include_str!("../../../.agents/skills/agent-html/references/examples.md"),
            is_managed: is_agenthtml_managed_examples_reference,
        },
        AgentHtmlSkillResource {
            relative_path: "references/icons.md",
            content: include_str!("../../../.agents/skills/agent-html/references/icons.md"),
            is_managed: is_agenthtml_managed_icons_reference,
        },
        AgentHtmlSkillResource {
            relative_path: "references/icon-names.txt",
            content: include_str!("../../../.agents/skills/agent-html/references/icon-names.txt"),
            is_managed: is_agenthtml_managed_icon_names_reference,
        },
        AgentHtmlSkillResource {
            relative_path: "scripts/search_icons.py",
            content: include_str!("../../../.agents/skills/agent-html/scripts/search_icons.py"),
            is_managed: is_agenthtml_managed_search_icons_script,
        },
        AgentHtmlSkillResource {
            relative_path: "agents/openai.yaml",
            content: include_str!("../../../.agents/skills/agent-html/agents/openai.yaml"),
            is_managed: is_agenthtml_managed_openai_agent,
        },
    ]
}

pub(super) fn write_managed_text(
    path: &Path,
    content: &str,
    is_managed: fn(&str) -> bool,
) -> WorkspaceResult<()> {
    if path.exists() {
        let existing = std::fs::read_to_string(path)?;
        if !is_managed(&existing) || existing == content {
            return Ok(());
        }
    }

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, content)?;
    Ok(())
}

pub(super) fn is_agenthtml_managed_skill(content: &str) -> bool {
    content.contains("name: agent-html")
        && (content.contains("This skill is the Codex bridge for the AgentHTML runtime contract.")
            || content.contains("Use when Codex needs to compose XML-like preview layouts"))
}

pub(super) fn is_agenthtml_managed_examples_reference(content: &str) -> bool {
    content.contains("# AgentHTML Examples")
        && (content.contains("Valid Patterns") || content.contains("Invalid Patterns"))
}

pub(super) fn is_agenthtml_managed_icons_reference(content: &str) -> bool {
    content.contains("# AgentHTML Icons")
        && content.contains("python .agents/skills/agent-html/scripts/search_icons.py")
}

pub(super) fn is_agenthtml_managed_icon_names_reference(content: &str) -> bool {
    content.starts_with("# AgentHTML managed Lucide icon index.")
}

pub(super) fn is_agenthtml_managed_search_icons_script(content: &str) -> bool {
    content.contains("def search_icons(")
        && ((content.contains("bundled_icon_names_path")
            && content.contains("references")
            && content.contains("icon-names.txt"))
            || (content.contains("lucide-react")
                && (content.contains("parents[3]")
                    || content.contains("find_repo_root")
                    || content.contains("dynamicIconImports"))))
}

pub(super) fn is_agenthtml_managed_openai_agent(content: &str) -> bool {
    content.contains("display_name: \"Agent HTML\"")
        && content.contains("default_prompt: \"Use $agent-html")
}

pub(super) fn is_agenthtml_managed_root_instructions(content: &str) -> bool {
    content.starts_with("# AgentHTML World\n")
        && content.contains("This directory is the AgentHTML workspace root.")
}
