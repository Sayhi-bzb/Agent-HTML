use rusqlite::{params, Connection, OptionalExtension};

use crate::workspace::types::{CompanyAgentState, WorkspaceResult};
use crate::workspace::util::current_timestamp;

const COMPANY_AGENT_STATE_ID: &str = "default";

pub(crate) fn get_company_agent_state(
    connection: &Connection,
) -> WorkspaceResult<CompanyAgentState> {
    let state = connection
        .query_row(
            "SELECT active_thread_id, updated_at
             FROM company_agent_state
             WHERE id = ?1",
            [COMPANY_AGENT_STATE_ID],
            |row| {
                Ok(CompanyAgentState {
                    active_thread_id: row.get(0)?,
                    updated_at: row.get(1)?,
                })
            },
        )
        .optional()?;

    Ok(state.unwrap_or_else(|| CompanyAgentState {
        active_thread_id: None,
        updated_at: current_timestamp(),
    }))
}

pub(crate) fn update_company_agent_state(
    connection: &Connection,
    active_thread_id: Option<&str>,
) -> WorkspaceResult<CompanyAgentState> {
    let now = current_timestamp();
    connection.execute(
        "INSERT INTO company_agent_state (id, active_thread_id, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET
            active_thread_id = excluded.active_thread_id,
            updated_at = excluded.updated_at",
        params![COMPANY_AGENT_STATE_ID, active_thread_id, now],
    )?;

    get_company_agent_state(connection)
}
