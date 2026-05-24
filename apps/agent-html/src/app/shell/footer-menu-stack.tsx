import * as React from "react"

import { SidebarMenu } from "@/shared/ui/sidebar"

export function FooterMenuStack({ children }: { children: React.ReactNode }) {
  return <SidebarMenu>{children}</SidebarMenu>
}
