import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { Root } from 'fumadocs-core/page-tree';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import { getProductByPathname } from '@/lib/products';
import type { Route } from './+types/docs-layout';

export async function loader({ request }: Route.LoaderArgs) {
  const { source } = await import('@/lib/source');
  const tree = source.getPageTree();
  const pathname = new URL(request.url).pathname;
  const product = getProductByPathname(pathname);

  return {
    productRoot: product.root,
    tree,
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
  const tree = loaderData.tree as Root;
  const tabs = getLayoutTabs(tree).filter(
    (tab) => tab.url === loaderData.productRoot || tab.url.startsWith(`${loaderData.productRoot}/`),
  );

  return (
    <DocsLayout
      {...base}
      nav={{ ...nav, mode: 'top' }}
      tabMode="navbar"
      tabs={tabs}
      tree={tree}
    >
      {children ?? <Outlet />}
    </DocsLayout>
  );
}
