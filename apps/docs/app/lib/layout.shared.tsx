import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ProductSelect } from '@/components/product-select';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <img alt="" aria-hidden="true" className="size-5" src="/ghost.svg" />
          <span>{appName}</span>
        </span>
      ),
      children: <ProductSelect />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
