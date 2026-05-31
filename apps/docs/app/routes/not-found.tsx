import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { DefaultNotFound } from 'fumadocs-ui/layouts/home/not-found';
import { baseOptions } from '@/lib/layout.shared';
import type { Route } from './+types/not-found';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Not Found' }];
}

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <DefaultNotFound />
    </HomeLayout>
  );
}
