export function createGalleryPreviewDocument(artifactProfile) {
  return {
    meta: createRenderConfigFromArtifactProfile(artifactProfile),
    components: [
      componentNode(
        "page",
        { title: `${artifactProfile.id} component gallery` },
        createGallerySectionNodes(artifactProfile),
      ),
    ],
  }
}

export function createGalleryPreviewSections(artifactProfile) {
  return createGallerySectionNodes(artifactProfile).map((node) => ({
    mode: resolveGallerySectionMode(node.props.title),
    node,
  }))
}

function createGallerySectionNodes(artifactProfile) {
  return [
    createCardsPreview(artifactProfile),
    createDashboardPreview(artifactProfile),
    createMailPreview(artifactProfile),
    createPricingPreview(artifactProfile),
    createFormsPreview(artifactProfile),
    createSelectionPreview(artifactProfile),
    createDisclosurePreview(artifactProfile),
  ]
}

function createRenderConfigFromArtifactProfile(artifactProfile) {
  return {
    artifactProfileReference: artifactProfile?.id,
    artifactProfile,
  }
}

function createCardsPreview(styleProfile) {
  return createCard("Cards Preview", [
    componentNode("frame", {}, [
      componentNode("grid", {}, [
        createCard("Revenue Pulse", [
          textNode(
            "Compact cards should keep title, body, and status layers distinct without drifting into a document layout.",
          ),
          componentNode("badge", { variant: "secondary" }, [
            textNode("synced"),
          ]),
          componentNode("progress", { value: "74" }, []),
        ]),
        createCard("Release Checklist", [
          textNode(
            "Muted copy, separators, and nested content blocks need to stay readable in one glance.",
          ),
          componentNode("separator", {}, []),
          componentNode("list", {}, [
            itemNode("Review color contrast"),
            itemNode("Check card depth"),
            itemNode("Verify hover states"),
          ]),
        ]),
      ]),
      componentNode("split", {}, [
        createCard("Alert Stack", [
          componentNode(
            "alert",
            { title: "Blocking issue", variant: "destructive" },
            [textNode("Primary actions should remain visible under alert states.")],
          ),
          componentNode("alert", { title: "Muted update", variant: "default" }, [
            textNode("Neutral status cards still need a clear hierarchy."),
          ]),
        ]),
        createCard("Surface Audit", [
          componentNode("table", {}, [
            rowNode("Layer", "Signal"),
            rowNode("Card", styleProfile.componentStyle.treatments.card ?? "none"),
            rowNode("Badge", styleProfile.componentStyle.treatments.badge ?? "none"),
            rowNode("Radius", styleProfile.globalStyle.radiusScale.base),
          ]),
        ]),
      ]),
    ]),
  ])
}

function createDashboardPreview(styleProfile) {
  return createCard("Dashboard Preview", [
    componentNode("frame", {}, [
      componentNode("split", {}, [
        createCard("Executive Summary", [
          textNode(
            "A dashboard preview should feel like a working product surface, not a component reference sheet.",
          ),
          componentNode("cluster", {}, [
            componentNode("badge", { variant: "secondary" }, [textNode("Q2")]),
            componentNode("badge", { variant: "outline" }, [textNode("Stable")]),
            componentNode("badge", { variant: "outline" }, [textNode("Ops")]),
          ]),
          componentNode("progress", { value: "82" }, []),
        ]),
        createCard("Review Queue", [
          componentNode("table", {}, [
            rowNode("Team", "Status"),
            rowNode("Platform", "Ready"),
            rowNode("Docs", "Review"),
            rowNode("Design", "Synced"),
          ]),
        ]),
      ]),
      componentNode("grid", {}, [
        createCard("Signal Cards", [
          componentNode("list", {}, [
            itemNode("Border rhythm stays even"),
            itemNode("Nested cards preserve depth"),
            itemNode("Muted zones read as secondary"),
          ]),
        ]),
        createCard("Token Snapshot", [
          componentNode("table", {}, [
            rowNode("Primary", styleProfile.globalStyle.tokenSets.light.primary),
            rowNode("Muted", styleProfile.globalStyle.tokenSets.light.muted),
            rowNode("Border", styleProfile.globalStyle.tokenSets.light.border),
          ]),
        ]),
      ]),
    ]),
  ])
}

function createPricingPreview(styleProfile) {
  return createCard("Pricing Preview", [
    componentNode("frame", {}, [
      componentNode("grid", {}, [
        createCard("Starter", [
          componentNode("badge", { variant: "outline" }, [textNode("solo")]),
          textNode(
            "A low-noise tier card should still show action hierarchy and body rhythm clearly.",
          ),
          componentNode("list", {}, [
            itemNode("Theme tokens"),
            itemNode("Gallery preview"),
            itemNode("Single workspace"),
          ]),
        ]),
        createCard("Team", [
          componentNode("badge", { variant: "secondary" }, [textNode("popular")]),
          textNode(
            "Mid-tier cards need stronger emphasis without becoming a marketing page.",
          ),
          componentNode("list", {}, [
            itemNode("Shared presets"),
            itemNode("Review surfaces"),
            itemNode("Saved profiles"),
          ]),
        ]),
      ]),
      componentNode("split", {}, [
        createCard("Enterprise", [
          textNode(
            "Larger pricing cards stress spacing, divider rhythm, and nested disclosure density.",
          ),
          componentNode("separator", {}, []),
          componentNode("list", {}, [
            itemNode("Release governance"),
            itemNode("Portable artifact checks"),
            itemNode("Dense editor shell"),
          ]),
        ]),
        createCard("Tier Comparison", [
          componentNode("table", {}, [
            rowNode("Tier", "Seats"),
            rowNode("Starter", "1"),
            rowNode("Team", "5"),
            rowNode("Enterprise", "25"),
          ]),
        ]),
      ]),
    ]),
  ])
}

function createMailPreview(styleProfile) {
  return createCard("Mail Preview", [
    componentNode("frame", {}, [
      componentNode("split", {}, [
        createCard("Mailbox", [
          componentNode(
            "input",
            {
              label: "Search inbox",
              value: "release notes",
              description: "Toolbar search field and input chrome.",
            },
            [],
          ),
          componentNode("list", {}, [
            itemNode("Inbox 128"),
            itemNode("Drafts 9"),
            itemNode("Sent"),
            itemNode("Archive 23"),
            itemNode("Priority"),
          ]),
          componentNode("cluster", {}, [
            componentNode("badge", { variant: "secondary" }, [textNode("All mail")]),
            componentNode("badge", { variant: "outline" }, [textNode("Unread 12")]),
          ]),
        ]),
        createCard("Focused Thread", [
          componentNode("table", {}, [
            rowNode("From", "Mia Chen"),
            rowNode("Subject", "Gallery alignment review"),
            rowNode("Status", "Needs reply"),
            rowNode("Theme", styleProfile.id),
          ]),
          textNode(
            "A mail surface should stress dense navigation, list selection, long-form reading, and reply composition within the same preview frame.",
          ),
          componentNode(
            "textarea",
            {
              label: "Reply draft",
              value:
                "Preview shell is aligned. Remaining work is matching the denser work-app rhythm from tweakcn.",
              description: "Composer density and nested field treatment.",
            },
            [],
          ),
        ]),
      ]),
      componentNode("grid", {}, [
        createCard("Inbox List", [
          componentNode("table", {}, [
            rowNode("Alicia Gomez", "Palette review ready"),
            rowNode("Noah Patel", "Mail preview references"),
            rowNode("Iris Park", "Need token sign-off"),
          ]),
        ]),
        createCard("Thread Actions", [
          componentNode("list", {}, [
            itemNode("Archive current thread"),
            itemNode("Reply with draft preset"),
            itemNode("Pin message for review"),
          ]),
        ]),
      ]),
    ]),
  ])
}

function createFormsPreview() {
  return createCard("Forms Preview", [
    componentNode("frame", {}, [
      componentNode("split", {}, [
        createCard("Inputs", [
          componentNode(
            "input",
            {
              label: "Owner",
              value: "Platform reviewer",
              description: "Single-line control.",
            },
            [],
          ),
          componentNode(
            "textarea",
            {
              label: "Notes",
              value:
                "Preview should reflect changes immediately without changing the authoring surface.",
              description: "Long-form control.",
            },
            [],
          ),
          componentNode(
            "slider",
            {
              label: "Density",
              value: "72",
              description: "Read-only slider preview.",
            },
            [],
          ),
        ]),
        createCard("Checks", [
          componentNode(
            "checkbox",
            {
              label: "Ship to runtime",
              checked: "true",
              description: "Checkbox state.",
            },
            [],
          ),
          componentNode(
            "switch",
            {
              label: "Sync preview",
              checked: "true",
              description: "Switch state.",
            },
            [],
          ),
        ]),
      ]),
    ]),
  ])
}

function createSelectionPreview(styleProfile) {
  return createCard("Selection Preview", [
    componentNode("frame", {}, [
      componentNode("split", {}, [
        createCard("Overlay Controls", [
          componentNode(
            "select",
            {
              label: "Profile family",
              value: styleProfile.id,
              description: "Select trigger, content, and item treatment.",
            },
            [
              optionNode("report-default", "report-default", "Builtin"),
              optionNode("ops-compact", "ops-compact", "Builtin"),
              optionNode("review-dense", "review-dense", "Builtin"),
            ],
          ),
          componentNode(
            "combobox",
            {
              label: "Style ref",
              value: styleProfile.id,
              description: "Combobox trigger and option body.",
            },
            [
              optionNode(styleProfile.id, styleProfile.id, "Current profile"),
              optionNode("team-ops", "team-ops", "User profile sample"),
            ],
          ),
        ]),
        createCard("Choice Groups", [
          componentNode(
            "radio-group",
            {
              label: "Direction",
              value: "stable",
              description: "Radio group density.",
            },
            [
              optionNode("stable", "Stable", "Favor predictability."),
              optionNode("fast", "Fast", "Favor speed."),
            ],
          ),
          componentNode(
            "toggle-group",
            {
              label: "Mode",
              value: "editor",
              description: "Inline option set.",
            },
            [
              optionNode("editor", "Editor", "Edit shell"),
              optionNode("gallery", "Gallery", "Preview grid"),
            ],
          ),
        ]),
      ]),
    ]),
  ])
}

function createDisclosurePreview() {
  return createCard("Disclosure Preview", [
    componentNode("frame", {}, [
      componentNode("split", {}, [
        createCard("Tabs", [
          componentNode("tabs", {}, [
            componentNode("tab", { value: "summary", label: "Summary" }, [
              createCard("Tabs Summary", [
                textNode(
                  "Tabs preview trigger contrast, content spacing, and nested card treatment.",
                ),
              ]),
            ]),
            componentNode("tab", { value: "details", label: "Details" }, [
              createCard("Tabs Details", [
                textNode(
                  "Component galleries should still preserve nested disclosure rhythm.",
                ),
              ]),
            ]),
          ]),
        ]),
        createCard("Accordion", [
          componentNode("accordion", {}, [
            componentNode(
              "accordion-item",
              { value: "palette", title: "Palette tokens" },
              [textNode("Expanded disclosure spacing should remain balanced.")],
            ),
            componentNode(
              "accordion-item",
              { value: "typography", title: "Typography" },
              [textNode("Heading and body font assignments surface here.")],
            ),
          ]),
        ]),
      ]),
    ]),
  ])
}

function resolveGallerySectionMode(title) {
  if (title === "Cards Preview") {
    return "components"
  }

  if (title === "Dashboard Preview") {
    return "dashboard"
  }

  if (title === "Mail Preview") {
    return "mail"
  }

  if (title === "Pricing Preview") {
    return "pricing"
  }

  if (title === "Forms Preview") {
    return "forms"
  }

  if (title === "Selection Preview") {
    return "selection"
  }

  return "disclosure"
}

function createCard(title, children) {
  return componentNode("card", { title }, children)
}

function itemNode(value) {
  return componentNode("item", {}, [textNode(value)])
}

function rowNode(left, right) {
  return componentNode("row", {}, [
    componentNode("cell", {}, [textNode(left)]),
    componentNode("cell", {}, [textNode(right)]),
  ])
}

function optionNode(value, label, content) {
  return componentNode("option", { value, label }, [textNode(content)])
}

function componentNode(name, props, children) {
  return {
    type: "component",
    name,
    props,
    children,
  }
}

function textNode(value) {
  return {
    type: "text",
    value,
  }
}
