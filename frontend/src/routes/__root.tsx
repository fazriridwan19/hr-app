import { Suspense } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PageSpinner } from '@/components/ui/Spinner';

export const Route = createRootRoute({
  component: () => (
    <>
      <Suspense fallback={<PageSpinner />}>
        <Outlet />
      </Suspense>
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      )}
    </>
  ),
});
