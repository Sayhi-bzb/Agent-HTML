import {
  index,
  prefix,
  type RouteConfig,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  ...prefix('docs', [
    route('', 'routes/docs-layout.tsx', [route('*', 'routes/docs.tsx')]),
  ]),
  route('api/search', 'routes/search.ts'),
  route('og/docs/*', 'routes/og.docs.tsx'),

  // LLM integration:
  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  route('llms.mdx/docs/*', 'llms/mdx.ts'),

  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
