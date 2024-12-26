"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider as Provider } from "react-query";

export function QueryClientProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return <Provider client={queryClient}>{children}</Provider>;
}
