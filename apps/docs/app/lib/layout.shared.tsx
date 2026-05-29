import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import Link from "fumadocs-core/link"

const products = [
  {
    label: "App",
    href: "/docs/app/overview",
  },
  {
    label: "Runtime",
    href: "/docs/runtime/overview",
  },
]

function ProductSwitcher() {
  return (
    <details className="group relative">
      <summary className="inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border bg-fd-background px-2.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground [&::-webkit-details-marker]:hidden">
        Product
        <span className="text-xs transition-transform group-open:rotate-180">v</span>
      </summary>
      <div className="absolute left-0 top-10 z-20 min-w-36 rounded-md border bg-fd-popover p-1 text-sm shadow-md">
        {products.map((product) => (
          <Link
            key={product.href}
            href={product.href}
            className="block rounded px-2 py-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            {product.label}
          </Link>
        ))}
      </div>
    </details>
  )
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Agent-HTML Docs",
      url: "/docs/app/overview",
      children: <ProductSwitcher />,
    },
    searchToggle: {
      enabled: false,
    },
    themeSwitch: {
      enabled: true,
    },
  }
}
