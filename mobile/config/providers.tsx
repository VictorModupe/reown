import React from "react";
import {QueryClient, QueryClientProvider, QueryCache, MutationCache} from "@tanstack/react-query";
import {Toaster} from "sonner-native";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => console.error("Query error:", error),
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown) => console.error("Mutation error:", error),
  }),
});

export default function Providers({children}: {children:React.ReactNode}) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        <Toaster position="top-center" />
        </QueryClientProvider>
    )
}