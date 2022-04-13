import { OperationVariables, QueryOptions, useApolloClient } from "@apollo/client";
import { datasource, useReadData, Datasource } from "@naporin0624/react-flowder";
import { Observable } from "rxjs";

import { datasources } from "./cache";

import type { TypedDocumentNode } from "@apollo/client";

export const useDatasource = <T = never, V = OperationVariables>(query: TypedDocumentNode<T, V>): Datasource<[Omit<QueryOptions<V, T>, "query"> | undefined], T> => {
  const client = useApolloClient();

  const cache = datasources.get(query);
  if (cache) return cache;

  const observable = (options?: Omit<QueryOptions<V, T>, "query">) => {
    const subscription = client.watchQuery({ query, ...options });
    return new Observable<T>((subscriber) => {
      subscription.subscribe(
        (next) => subscriber.next(next.data),
        (err) => {
          subscriber.error(err);
        },
        () => subscriber.complete()
      );
    });
  };

  const resource = datasource(observable);
  datasources.set(query, resource);
  return resource;
};

export function useSyncQuery<T = never, V extends OperationVariables = OperationVariables>(query: QueryOptions<V, T>["query"], options?: Omit<QueryOptions<V, T>, "query">): T {
  const datasource = useDatasource(query);

  return useReadData(datasource(options));
}
