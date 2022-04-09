import type { DocumentNode, QueryOptions } from "@apollo/client";
import type { Datasource } from "@naporin0624/react-flowder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const datasources = new Map<DocumentNode, Datasource<[Omit<QueryOptions<any, any>, "query"> | undefined], any>>();
