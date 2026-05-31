import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { baseOptions } from '@/lib/layout.shared';
import type { Route } from './+types/home';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'AgentHTML Docs' },
    {
      name: 'description',
      content:
        'Documentation for the AgentHTML app, runtime, and artifact workflow.',
    },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="p-4 flex flex-col items-center justify-center text-center flex-1">
        <h1 className="text-xl font-bold mb-2">AgentHTML Docs</h1>
        <p className="text-fd-muted-foreground mb-4">
          App and runtime references for building durable agent-authored
          artifacts.
        </p>
        <Link
          className="text-sm bg-fd-primary text-fd-primary-foreground rounded-full font-medium px-4 py-2.5"
          to="/docs"
        >
          Open Docs
        </Link>
      </div>
    </HomeLayout>
  );
}
