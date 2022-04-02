import { useMemo } from "react";

import { NetworkStatus, OperationVariables, QueryOptions, useApolloClient } from "@apollo/client";

export function useQuery<T = never, V = OperationVariables>(query: QueryOptions<V, T>["query"], options?: Omit<QueryOptions<V, T>, "query">): T {
  const client = useApolloClient();
  const queryOptions: QueryOptions<V, T> = useMemo(() => ({ query, ...(options ? options : {}) }), [options, query]);

  const subscription = client.watchQuery(queryOptions);
  const result = subscription.getCurrentResult();

  switch (result.networkStatus) {
    case NetworkStatus.loading: {
      throw subscription.result();
    }
    case NetworkStatus.error: {
      throw subscription.getLastError();
    }
    default: {
      return subscription.getCurrentResult().data;
    }
  }
}
