import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { Root } from 'fumadocs-core/page-tree';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import type { Route } from './+types/docs-layout';

const productTabs = {
  app: [
    { title: 'Overview', url: '/docs/app' },
    { title: 'Demo', url: '/docs/app/demo' },
  ],
  runtime: [
    { title: 'Overview', url: '/docs/runtime' },
    { title: 'Demo', url: '/docs/runtime/demo' },
  ],
} satisfies Record<string, LayoutTab[]>;

export async function loader({ request }: Route.LoaderArgs) {
  const { source } = await import('@/lib/source');
  const pathname = new URL(request.url).pathname;
  const product = pathname.startsWith('/docs/runtime') ? 'runtime' : 'app';

  return {
    tabs: productTabs[product],
    tree: source.getPageTree(),
  };
}

export default function Layout({
  children,
  loaderData,
}: {
  children?: ReactNode;
  loaderData: Route.ComponentProps['loaderData'];
}) {
  const { nav, ...base } = baseOptions();

  return (
    <DocsLayout
      {...base}
      nav={{ ...nav, mode: 'top' }}
      tabMode="navbar"
      tabs={loaderData.tabs}
      tree={loaderData.tree as Root}
    >
      {children ?? <Outlet />}
    </DocsLayout>
  );
}
