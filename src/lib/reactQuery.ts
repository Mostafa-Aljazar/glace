import { QueryClient } from "@tanstack/react-query";

const defaultOptions = {
  queries: {
    retry: 1,
    staleTime: 1000 * 60 * 5,
  },
};

/**
 * A fresh QueryClient for one server render.
 *
 * Must never be a module-level singleton on the server: the module is shared
 * across every request, so one client would leak one visitor's cached data
 * into another's render and grow without bound.
 */
export function createQueryClient() {
  return new QueryClient({ defaultOptions });
}

export default createQueryClient;
