import React from "react";
import {QueryClient, QueryClientProvider, QueryCache, MutationCache} from "@tanstack/react-query";
import {Toaster} from "sonner-native";

export default function Providers({children}: {children:React.ReactNode}) {
    const queryClient = new QueryClient({
      queryCache: new QueryCache({
        onError: (error: any) => console.error("Query error:", error),
      }),
      mutationCache: new MutationCache({
        onError: (error: any) => console.error("Mutation error:", error),
      }),
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        <Toaster position="top-center" />
        </QueryClientProvider>
    )
}