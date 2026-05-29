import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Agent-HTML Docs",
      url: "/docs/app/overview",
    },
    searchToggle: {
      enabled: false,
    },
    themeSwitch: {
      enabled: true,
    },
    links: [
      {
        type: "menu",
        text: "Product",
        items: [
          {
            type: "main",
            text: "App",
            description: "Application shell docs",
            url: "/docs/app/overview",
          },
          {
            type: "main",
            text: "Runtime",
            description: "Agent-HTML runtime docs",
            url: "/docs/runtime/overview",
          },
        ],
      },
    ],
  }
}
