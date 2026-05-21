import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { extractFontName } from "../helpers"
import { GalleryPreviewMeta } from "../shared/chrome"
import { FieldRow } from "../shared/form-controls"
import type { PreviewSceneProps } from "./types"

export function GalleryMailWorkbenchPanel({
  profile,
  previewThemeMode,
}: PreviewSceneProps) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-mail-shell">
        <aside
          className="ahtml-gallery-mail-nav"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.nav"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
          style={{
            background: tokens.sidebar,
            borderColor: tokens.sidebarBorder,
            color: tokens.sidebarForeground,
          }}
        >
          <div className="ahtml-gallery-mail-nav-profile">
            <span className="ahtml-gallery-stage-panel-kicker">
              Mail workbench
            </span>
            <strong>Ops Inbox</strong>
            <p>Triage, thread review, and reply drafting stay in one frame.</p>
          </div>
          <Button type="button">Compose</Button>
          <Input readOnly value="Search inbox" />
          <div className="ahtml-gallery-mail-nav-section">
            <span className="ahtml-gallery-mail-nav-label">Folders</span>
            <div className="ahtml-gallery-mail-nav-links">
              <span className="is-active">Inbox 128</span>
              <span>Drafts 9</span>
              <span>Sent</span>
              <span>Archive 23</span>
              <span>Later</span>
            </div>
          </div>
          <div className="ahtml-gallery-mail-nav-section">
            <span className="ahtml-gallery-mail-nav-label">Queues</span>
            <div className="ahtml-gallery-mail-nav-links">
              <span>Needs review 5</span>
              <span>Releases 3</span>
              <span>Partner replies 7</span>
            </div>
          </div>
          <div className="ahtml-gallery-custom-badges">
            <Badge variant="secondary">All mail</Badge>
            <Badge variant="outline">Unread 12</Badge>
          </div>
        </aside>
        <section
          className="ahtml-gallery-mail-list"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.list"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
        >
          <div className="ahtml-gallery-mail-list-header">
            <div className="ahtml-gallery-mail-list-heading">
              <div className="ahtml-gallery-inline-metrics">
                <h5>Focused inbox</h5>
                <div className="ahtml-gallery-mail-tab-pills">
                  <Badge variant="secondary">All mail</Badge>
                  <Badge variant="outline">Unread</Badge>
                </div>
              </div>
              <p>Dense list rhythm should still feel sortable, scannable, and app-native.</p>
            </div>
            <div className="ahtml-gallery-mail-search-wrap">
              <Search
                aria-hidden="true"
                className="ahtml-gallery-mail-search-icon"
              />
              <Input readOnly value="Search" />
            </div>
          </div>
          <div className="ahtml-gallery-mail-list-toolbar">
            <Badge variant="secondary">Focused</Badge>
            <Badge variant="outline">Today</Badge>
            <Badge variant="outline">Release ops</Badge>
          </div>
          {[
            [
              "Mia Chen",
              "Release checklist for Tuesday",
              "Needs reply",
              "Please confirm final copy, token lock, and delivery window before the release handoff closes.",
              "09:12",
            ],
            [
              "Alicia Gomez",
              "Palette approval received",
              "Unread",
              "Dark mode navigation and composer colors are locked for the release bundle.",
              "08:41",
            ],
            [
              "Noah Patel",
              "Partner assets uploaded",
              "Pinned",
              "Attachment set includes the outbound brief, delivery sheet, and updated sizing notes.",
              "Yesterday",
            ],
          ].map(([author, subject, state, snippet, time], index) => (
            <button
              className={[
                "ahtml-gallery-mail-list-item",
                index === 0 ? "is-active" : null,
              ]
                .filter(Boolean)
                .join(" ")}
              key={author}
              type="button"
            >
              <div className="ahtml-gallery-inline-metrics">
                <strong>{author}</strong>
                <span>{time}</span>
              </div>
              <div className="ahtml-gallery-mail-list-item-copy">
                <span className="ahtml-gallery-mail-list-item-subject">
                  {subject}
                </span>
                <p>{snippet}</p>
              </div>
              <div className="ahtml-gallery-mail-list-item-footer">
                <Badge variant={index === 0 ? "secondary" : "outline"}>
                  {state}
                </Badge>
                <span>{index === 0 ? "Needs action" : "In thread"}</span>
              </div>
            </button>
          ))}
        </section>
        <article
          className="ahtml-gallery-mail-display"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.display"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
          style={{
            letterSpacing: profile.globalStyle.typography.letterSpacing,
          }}
        >
          <header className="ahtml-gallery-mail-display-header ahtml-gallery-workbench-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div className="ahtml-gallery-workbench-header-copy">
              <span className="ahtml-gallery-stage-panel-kicker">
                Mail preview
              </span>
              <h4>Release checklist for Tuesday</h4>
              <p>From Mia Chen · Theme {profile.id}</p>
            </div>
            <div className="ahtml-gallery-stage-toolbar-meta">
              <GalleryPreviewMeta label="Primary" value={tokens.primary} />
              <GalleryPreviewMeta label="Sidebar" value={tokens.sidebar} />
              <GalleryPreviewMeta
                label="Mono"
                value={extractFontName(profile.globalStyle.typography.fontMono)}
              />
            </div>
          </header>
          <div className="ahtml-gallery-mail-display-actions">
            <Badge variant="outline">Reply</Badge>
            <Badge variant="outline">Archive</Badge>
            <Badge variant="secondary">Assigned</Badge>
          </div>
          <div className="ahtml-gallery-mail-thread-summary ahtml-gallery-workbench-summary-grid">
            <FieldRow label="Participants" value="Mia, Alicia, Noah" />
            <FieldRow label="Queue" value="Release ops" />
            <FieldRow label="Last action" value="09:12" />
          </div>
          <div className="ahtml-gallery-mail-display-body">
            <p>
              Team review is complete for the release surface. We only need
              final confirmation on copy lock, token freeze, and outbound
              timing before the release moves to scheduled send.
            </p>
            <p>
              Please reply with the final subject line, confirm the partner
              attachment set, and flag anything that should stay in draft until
              the release window opens.
            </p>
            <div className="ahtml-gallery-mail-quote">
              <strong>Quoted context</strong>
              <p>
                Final review notes: keep the inbox thread concise, preserve the
                action hierarchy in the detail pane, and ship the locked
                sidebar token set with the release bundle.
              </p>
            </div>
            <div className="ahtml-gallery-mail-attachments">
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>release-brief.pdf</strong>
                <span>Approved messaging</span>
              </div>
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>delivery-window.csv</strong>
                <span>Regional send schedule</span>
              </div>
            </div>
          </div>
          <div className="ahtml-gallery-mail-composer">
            <Textarea
              readOnly
              value={`Reply draft\n\nPrimary ${tokens.primary}\nSidebar ${tokens.sidebar}\nMono ${profile.globalStyle.typography.fontMono}\nRadius ${profile.globalStyle.radiusScale.base}`}
            />
            <div className="ahtml-gallery-mail-composer-footer">
              <Badge variant="outline">⌘ Enter to send</Badge>
              <span>Composer keeps token, mono, and spacing shifts visible.</span>
              <Button size="sm" type="button">
                Send draft
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
