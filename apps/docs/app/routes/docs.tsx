import browserCollections from 'collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { redirect } from 'react-router';
import { getMDXComponents } from '@/components/mdx';
import { getPageImagePath } from '@/lib/og';
import { gitConfig } from '@/lib/shared';
import { getPageMarkdownUrl, source } from '@/lib/source';
import type { Route } from './+types/docs';

export async function loader({ params, request }: Route.LoaderArgs) {
  const slugs = params['*'].split('/').filter((v) => v.length > 0);
  if (slugs.length === 0) {
    const url = new URL(request.url);

    throw redirect(`/docs/start${url.search}`);
  }

  if (slugs[0] === 'canvas') {
    const url = new URL(request.url);
    const nextPath = ['docs', ...slugs.slice(1)].join('/');

    throw redirect(`/${nextPath}${url.search}`);
  }

  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    path: page.path,
    markdownUrl: getPageMarkdownUrl(page).url,
    imagePath: getPageImagePath(slugs),
  };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: Mdx },
    // you can define props for the `<Content />` component
    {
      markdownUrl,
      path,
      imagePath,
    }: {
      markdownUrl: string;
      path: string;
      imagePath: string;
    },
  ) {
    const mdxComponents = getMDXComponents();

    return (
      <DocsPage toc={toc}>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <meta property="og:image" content={imagePath} />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <Mdx components={mdxComponents} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, imagePath, markdownUrl } = loaderData;

  return clientLoader.useContent(path, { markdownUrl, path, imagePath });
}
