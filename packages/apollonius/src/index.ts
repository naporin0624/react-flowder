import { datasource, useReadData, Datasource } from "@naporin0624/react-flowder";
import { DocumentNode, OperationVariables, QueryOptions, useApolloClient } from "@apollo/client";
import { Observable } from "rxjs";
import type { TypedDocumentNode } from "@apollo/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheMap = new WeakMap<DocumentNode, Datasource<[Omit<QueryOptions<any, any>, "query"> | undefined], any>>();

const useDatasource = <T = never, V = OperationVariables>(query: TypedDocumentNode<T, V>): Datasource<[Omit<QueryOptions<V, T>, "query"> | undefined], T> => {
  const client = useApolloClient();

  const cache = cacheMap.get(query);
  if (cache) return cache;

  const observable = (options?: Omit<QueryOptions<V, T>, "query">) => {
    const subscription = client.watchQuery({ query, ...options });
    return new Observable<T>((subscriber) => {
      subscription.subscribe(
        (next) =>
          next.data
            ? subscriber.next(next.data)
            : {
                /** noop */
              },
        (err) => subscriber.error(err),
        () => subscriber.complete()
      );
    });
  };

  const resource = datasource(observable);
  cacheMap.set(query, resource);
  return resource;
};

export function useQuery<T = never, V extends OperationVariables = OperationVariables>(query: QueryOptions<V, T>["query"], options?: Omit<QueryOptions<V, T>, "query">): T {
  const datasource = useDatasource(query);

  return useReadData(datasource(options));
}
