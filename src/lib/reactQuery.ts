import { QueryClient } from "@tanstack/react-query";

// Centralized QueryClient for server prefetching and client hydration
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
        },
    },
});

export default queryClient;
