use rusqlite::{params, Connection};

use crate::workspace::types::{WorkspaceProject, WorkspaceResult, WorkspaceSection};
use crate::workspace::util::current_timestamp;

const INTRODUCE_AGENT_HTML_SOURCE: &str =
    include_str!("../../../apps/agent-html-app/src/workspace/fixtures/introduce-agent-html.ahtml");
const INTRODUCE_AGENT_HTML_ZH_SOURCE: &str = include_str!(
    "../../../apps/agent-html-app/src/workspace/fixtures/introduce-agent-html-cn.ahtml"
);

#[cfg(test)]
pub(crate) fn introduce_agent_html_source() -> &'static str {
    INTRODUCE_AGENT_HTML_SOURCE
}

pub(crate) fn migrate_managed_example_source(
    project_id: &str,
    section_id: &str,
    source: &str,
) -> Option<&'static str> {
    if project_id == "agent-html-example"
        && section_id == "introduce-agent-html"
        && is_legacy_managed_introduce_agent_html_source(source)
    {
        return Some(INTRODUCE_AGENT_HTML_SOURCE);
    }

    None
}

fn is_legacy_managed_introduce_agent_html_source(source: &str) -> bool {
    source.contains("<Cell title=\"agent-html\">")
        && source.contains("turns layout nodes into Notion-like blocks")
        && source.contains("Hover any section")
        && source.contains("<Separator />")
}

pub(crate) fn seed_if_empty(connection: &mut Connection) -> WorkspaceResult<()> {
    let count: i64 = connection.query_row("SELECT COUNT(*) FROM projects", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    let now = current_timestamp();
    let projects = seed_projects();
    let transaction = connection.unchecked_transaction()?;

    for project in projects {
        transaction.execute(
            "INSERT INTO projects (id, name, slug, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![project.id, project.name, project.slug, now, now],
        )?;

        for section in seed_sections(&project.id) {
            transaction.execute(
                "INSERT INTO project_sections
                 (id, project_id, title, group_title, sort_order, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    section.id,
                    section.project_id,
                    section.title,
                    section.group_title,
                    section.sort_order,
                    now,
                    now
                ],
            )?;

            transaction.execute(
                "INSERT INTO project_section_documents
                 (project_id, section_id, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4)",
                params![section.project_id, section.id, now, now],
            )?;
        }
    }

    transaction.commit()?;
    Ok(())
}

pub(crate) fn seed_introduce_examples(connection: &mut Connection) -> WorkspaceResult<()> {
    let now = current_timestamp();
    let project = WorkspaceProject {
        id: "agent-html-example".to_string(),
        name: "Agent-HTML Example".to_string(),
        slug: "agent-html-example".to_string(),
    };
    let sections = [
        (
            seed_section(
                &project.id,
                "introduce-agent-html",
                "Introducing agent-html",
                "Example Cases",
                0,
            ),
            INTRODUCE_AGENT_HTML_SOURCE,
        ),
        (
            seed_section(
                &project.id,
                "introduce-agent-html-zh",
                "介绍 agent-html",
                "Example Cases",
                1,
            ),
            INTRODUCE_AGENT_HTML_ZH_SOURCE,
        ),
    ];
    let transaction = connection.unchecked_transaction()?;

    transaction.execute(
        "INSERT OR IGNORE INTO projects (id, name, slug, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![project.id, project.name, project.slug, now, now],
    )?;

    for (section, _source) in sections {
        transaction.execute(
            "INSERT OR IGNORE INTO project_sections
             (id, project_id, title, group_title, sort_order, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                section.id,
                section.project_id,
                section.title,
                section.group_title,
                section.sort_order,
                now,
                now
            ],
        )?;

        transaction.execute(
            "INSERT OR IGNORE INTO project_section_documents
             (project_id, section_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![section.project_id, section.id, now, now],
        )?;
    }

    transaction.commit()?;
    Ok(())
}

pub(crate) fn seed_section(
    project_id: &str,
    id: &str,
    title: &str,
    group_title: &str,
    sort_order: i64,
) -> WorkspaceSection {
    WorkspaceSection {
        group_title: group_title.to_string(),
        id: id.to_string(),
        project_id: project_id.to_string(),
        sort_order,
        title: title.to_string(),
    }
}

pub(crate) fn create_blank_project_source(project: &WorkspaceProject) -> String {
    format!(
        r#"<Cell title="{project_name}">
  <Stack>
    <Block>
      <Section width="content">
        <Stack>
          <Stack>
            <Text variant="h1">{project_name}</Text>
            <Text variant="lead">Start shaping this workspace artifact from a blank Agent-HTML document.</Text>
          </Stack>
          <Alert>
            <Icon name="file-plus-2" />
            <AlertTitle>Blank project</AlertTitle>
            <AlertDescription>This overview section is stored as artifact.agent-html in the AgentHTML workspace.</AlertDescription>
          </Alert>
        </Stack>
      </Section>
    </Block>
  </Stack>
</Cell>"#,
        project_name = project.name,
    )
}

pub(crate) fn create_blank_section_source(
    project: &WorkspaceProject,
    section: &WorkspaceSection,
) -> String {
    format!(
        r#"<Cell title="{project_name} - {section_title}">
  <Stack>
    <Block>
      <Section width="content">
        <Stack>
          <Stack>
            <Text variant="h1">{section_title}</Text>
            <Text variant="lead">Start shaping this workspace section from a blank Agent-HTML document.</Text>
          </Stack>
          <Alert>
            <Icon name="file-text" />
            <AlertTitle>Blank section</AlertTitle>
            <AlertDescription>This section is stored as artifact.agent-html in the AgentHTML workspace.</AlertDescription>
          </Alert>
        </Stack>
      </Section>
    </Block>
  </Stack>
</Cell>"#,
        project_name = project.name,
        section_title = section.title,
    )
}

pub(crate) fn create_initial_document_source(
    project: &WorkspaceProject,
    section: &WorkspaceSection,
) -> String {
    if project.id == "agent-html-example" && section.id == "introduce-agent-html" {
        return INTRODUCE_AGENT_HTML_SOURCE.to_string();
    }

    if project.id == "agent-html-example" && section.id == "introduce-agent-html-zh" {
        return INTRODUCE_AGENT_HTML_ZH_SOURCE.to_string();
    }

    create_seed_document_source(project, section)
}

fn seed_projects() -> Vec<WorkspaceProject> {
    vec![
        WorkspaceProject {
            id: "design-engineering".to_string(),
            name: "Design Engineering".to_string(),
            slug: "design-engineering".to_string(),
        },
        WorkspaceProject {
            id: "developer-docs".to_string(),
            name: "Developer Docs".to_string(),
            slug: "developer-docs".to_string(),
        },
        WorkspaceProject {
            id: "product-brief".to_string(),
            name: "Product Brief".to_string(),
            slug: "product-brief".to_string(),
        },
    ]
}

fn seed_sections(project_id: &str) -> Vec<WorkspaceSection> {
    vec![
        seed_section(
            project_id,
            "installation",
            "Installation",
            "Getting Started",
            0,
        ),
        seed_section(
            project_id,
            "project-structure",
            "Project Structure",
            "Getting Started",
            1,
        ),
        seed_section(
            project_id,
            "routing",
            "Routing",
            "Build Your Application",
            2,
        ),
        seed_section(
            project_id,
            "data-fetching",
            "Data Fetching",
            "Build Your Application",
            3,
        ),
        seed_section(
            project_id,
            "rendering",
            "Rendering",
            "Build Your Application",
            4,
        ),
        seed_section(
            project_id,
            "caching",
            "Caching",
            "Build Your Application",
            5,
        ),
    ]
}

pub(crate) fn create_seed_document_source(
    project: &WorkspaceProject,
    section: &WorkspaceSection,
) -> String {
    format!(
        r#"<Cell title="{project_name} - {section_title}">
  <Stack>
    <Block>
      <Section width="content">
        <Stack>
          <Stack>
            <Text variant="h1">{section_title}</Text>
            <Text variant="lead">{project_name} workspace content rendered through the agent-html runtime.</Text>
          </Stack>
          <Alert>
            <Icon name="file-text" />
            <AlertTitle>Workspace artifact</AlertTitle>
            <AlertDescription>This section is loaded from artifact.agent-html in the AgentHTML workspace.</AlertDescription>
          </Alert>
          <Grid columns="3">
            <Card>
              <CardHeader>
                <CardTitle>Project</CardTitle>
                <CardDescription>{project_name}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Section</CardTitle>
                <CardDescription>{group_title}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Runtime</CardTitle>
                <CardDescription>parse -> validate -> render</CardDescription>
              </CardHeader>
            </Card>
          </Grid>
        </Stack>
      </Section>
    </Block>
  </Stack>
</Cell>"#,
        group_title = section.group_title,
        project_name = project.name,
        section_title = section.title,
    )
}
