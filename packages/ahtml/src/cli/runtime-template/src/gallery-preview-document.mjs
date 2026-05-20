import { createRenderConfigFromStyleProfile } from "@agent-html/core"

export function createGalleryPreviewDocument(styleProfile) {
  return {
    meta: createRenderConfigFromStyleProfile(styleProfile),
    components: [
      componentNode(
        "page",
        { title: `${styleProfile.id} component gallery` },
        createGallerySectionNodes(styleProfile),
      ),
    ],
  }
}

export function createGalleryPreviewSections(styleProfile) {
  return createGallerySectionNodes(styleProfile).map((node) => ({
    mode: resolveGallerySectionMode(node.props.title),
    node,
  }))
}

function createGallerySectionNodes(styleProfile) {
  return [
    createCard("Feedback Gallery", [
      createCard("Status Surfaces", [
        textNode(
          "Alerts, badges, and progress indicators reveal contrast, treatment, and emphasis quickly.",
        ),
        componentNode("badge", { variant: "secondary" }, [textNode("healthy")]),
        componentNode("alert", { title: "Review block", variant: "destructive" }, [
          textNode(
            "A destructive state should remain distinct under both themes.",
          ),
        ]),
        componentNode("progress", { value: "68" }, []),
      ]),
      createCard("Surface Signals", [
        textNode(
          "Badge and alert families should stay distinguishable in one glance.",
        ),
        componentNode("badge", { variant: "outline" }, [textNode("outline")]),
        componentNode("badge", { variant: "secondary" }, [
          textNode("secondary"),
        ]),
        componentNode("alert", { title: "Muted notice", variant: "default" }, [
          textNode("Neutral surfaces should still feel intentional."),
        ]),
      ]),
    ]),
    createCard("Content Gallery", [
      createCard("Cards and Lists", [
        textNode(
          "Card shells, separators, and list rhythm make typography and spacing drift obvious.",
        ),
        componentNode("separator", {}, []),
        componentNode("list", {}, [
          itemNode("Operations review summary"),
          itemNode("Release checklist copy density"),
          itemNode("Portable artifact reading comfort"),
        ]),
      ]),
      createCard("Table", [
        componentNode("table", {}, [
          rowNode("Surface", "Signal"),
          rowNode("Card", styleProfile.componentStyle.treatments.card ?? "none"),
          rowNode("Tabs", styleProfile.componentStyle.treatments.tabs ?? "none"),
          rowNode("Radius", styleProfile.globalStyle.radiusScale.base),
        ]),
      ]),
    ]),
    createCard("Form Gallery", [
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
      createCard("Selections", [
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
    createCard("Overlay Gallery", [
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
    ]),
    createCard("Disclosure Gallery", [
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
  ]
}

function resolveGallerySectionMode(title) {
  if (title === "Feedback Gallery" || title === "Content Gallery") {
    return "components"
  }

  if (title === "Form Gallery" || title === "Overlay Gallery") {
    return "forms"
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
