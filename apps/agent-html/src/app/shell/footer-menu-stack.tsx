import * as React from "react"

import { SidebarMenu } from "@/components/ui/sidebar"

export function FooterMenuStack({ children }: { children: React.ReactNode }) {
  return <SidebarMenu>{children}</SidebarMenu>
}
