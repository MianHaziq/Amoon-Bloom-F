"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClientProvider,
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "@/services/queryClient";

interface QueryProviderProps {
  children: ReactNode;
  /** Server-fetched query state (e.g. the regions list) to seed the client
   * cache with, so region-dependent client components (currency signs,
   * country names) resolve synchronously on first render instead of racing a
   * fresh fetch after hydration — see RootLayout. */
  dehydratedState?: DehydratedState;
}

export function QueryProvider({ children, dehydratedState }: QueryProviderProps) {
  const [client] = useState(() => createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
}
