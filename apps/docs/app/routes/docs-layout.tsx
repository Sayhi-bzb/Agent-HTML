import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function Layout({ children }: { children?: ReactNode }) {
  const { nav, ...base } = baseOptions();

  return (
    <DocsLayout
      {...base}
      nav={{ ...nav, mode: 'top' }}
      tabMode="navbar"
      tree={source.getPageTree()}
    >
      {children ?? <Outlet />}
    </DocsLayout>
  );
}
