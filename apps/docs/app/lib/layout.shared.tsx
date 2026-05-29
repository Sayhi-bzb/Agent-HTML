import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ProductSelect } from '@/components/product-select';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
      children: <ProductSelect />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
