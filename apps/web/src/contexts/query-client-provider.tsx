"use client";

import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider as Provider } from "react-query";

const queryClient = new QueryClient();

export function QueryClientProvider({ children }: PropsWithChildren) {
  return <Provider client={queryClient}>{children}</Provider>;
}
