import type { SessionSummary } from "@/lib/types"

type MockPreviewArtifactInput = {
  sessionName: string
  status: string
  title: string
  lead: string
  notes: string[]
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function renderMockPreviewArtifact({
  sessionName,
  status,
  title,
  lead,
  notes,
}: MockPreviewArtifactInput): string {
  // This inline HTML/CSS is preview artifact sample content.
  // It intentionally does not inherit the app shell design system contract.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: ui-sans-serif, system-ui, sans-serif;
        background: #0f141b;
        color: #eef3fb;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at top, rgba(255, 122, 26, 0.08), transparent 22%),
          linear-gradient(180deg, #0d1218 0%, #10151c 100%);
        padding: 0;
      }
      main {
        max-width: 980px;
        margin: 0 auto;
        display: grid;
        gap: 28px;
        min-height: 100vh;
        padding: 32px 36px 40px;
      }
      .topline {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #90a0b8;
        font-size: 12px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .status {
        color: #ffbf7f;
        font-weight: 600;
      }
      h1 {
        margin: 0;
        max-width: 14ch;
        font-size: 44px;
        line-height: 1.02;
        letter-spacing: -0.05em;
      }
      p {
        margin: 0;
        color: #9aabc4;
        line-height: 1.6;
      }
      ul {
        margin: 0;
        padding-left: 20px;
        color: #dbe4ef;
        display: grid;
        gap: 12px;
      }
      li::marker {
        color: #6c7b92;
      }
      .divider {
        height: 1px;
        background: rgba(145, 167, 199, 0.12);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="topline">
        <span>${escapeHtml(sessionName)}</span>
        <span class="status">${escapeHtml(status)}</span>
      </div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(lead)}</p>
      <div class="divider"></div>
      <ul>
        ${notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </main>
  </body>
</html>`
}

export function getDefaultMockPreviewArtifact(): string {
  return renderMockPreviewArtifact({
    sessionName: "Vendor decision",
    status: "Recommendation",
    title: "Choose Vendor A for the initial rollout.",
    lead:
      "Lower migration risk and faster delivery make Vendor A the safest launch path, with targeted monitoring after release.",
    notes: [
      "Migration complexity stays inside the current delivery window.",
      "Support load is lower during the initial release phase.",
      "Observability and rollback playbooks still need to be finalized.",
    ],
  })
}

export function createMockPreviewArtifact(
  summary: SessionSummary,
  title: string,
  lead: string,
  notes: string[],
): string {
  return renderMockPreviewArtifact({
    sessionName: summary.name,
    status: summary.status,
    title,
    lead,
    notes,
  })
}
