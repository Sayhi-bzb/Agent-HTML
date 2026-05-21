import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { extractFontName } from "../helpers"
import { GalleryPreviewMeta } from "../shared/chrome"
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
          <Button type="button">Compose</Button>
          <Input readOnly value="Search inbox" />
          <div className="ahtml-gallery-mail-nav-links">
            <span className="is-active">Inbox 128</span>
            <span>Drafts 9</span>
            <span>Sent</span>
            <span>Archive 23</span>
            <span>Later</span>
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
            <div className="ahtml-gallery-inline-metrics">
              <h5>Inbox</h5>
              <div className="ahtml-gallery-mail-tab-pills">
                <Badge variant="secondary">All mail</Badge>
                <Badge variant="outline">Unread</Badge>
              </div>
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
          </div>
          {[
            [
              "Mia Chen",
              "Gallery alignment review",
              "Needs reply",
              "Preview shell is aligned. Remaining work is matching the denser work-app rhythm.",
              "09:12",
            ],
            [
              "Alicia Gomez",
              "Palette review ready",
              "Unread",
              "Dark mode sidebar tokens are finally reading like a real product surface.",
              "08:41",
            ],
            [
              "Noah Patel",
              "Mail preview references",
              "Pinned",
              "Collected structural refs from tweakcn mail and dashboard examples.",
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
              <span>{subject}</span>
              <p>{snippet}</p>
              <Badge variant={index === 0 ? "secondary" : "outline"}>
                {state}
              </Badge>
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
          <header className="ahtml-gallery-mail-display-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div>
              <span className="ahtml-gallery-stage-panel-kicker">
                Mail preview
              </span>
              <h4>Gallery alignment review</h4>
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
          <div className="ahtml-gallery-mail-display-body">
            <p>
              Preview shell is aligned. Remaining work is matching the denser
              work-app rhythm from tweakcn and reducing synthetic layout
              feeling.
            </p>
            <p>
              Focus on the inbox/list/detail relationship and keep the tool feel
              closer to an app than to a component catalog.
            </p>
            <div className="ahtml-gallery-mail-quote">
              <strong>Quoted context</strong>
              <p>
                Current workbench shell is substantially closer. Remaining drift
                comes from preview surfaces still reading as handcrafted demos
                instead of product-native examples.
              </p>
            </div>
            <div className="ahtml-gallery-mail-attachments">
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>design.md</strong>
                <span>Visual gap notes</span>
              </div>
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>gallery.md</strong>
                <span>Product standard</span>
              </div>
            </div>
          </div>
          <Textarea
            readOnly
            value={`Reply draft\n\nPrimary ${tokens.primary}\nSidebar ${tokens.sidebar}\nMono ${profile.globalStyle.typography.fontMono}\nRadius ${profile.globalStyle.radiusScale.base}`}
          />
          <div className="ahtml-gallery-inline-metrics">
            <Badge variant="outline">⌘ Enter to send</Badge>
            <Button size="sm" type="button">
              Send draft
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}
