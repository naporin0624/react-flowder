/* eslint-disable @typescript-eslint/no-explicit-any */
import stringify from "fast-json-stable-stringify";
import { isObservable, Observable } from "rxjs";

type Resource<Args extends unknown[], T> = (...args: Args) => Observable<T>;

declare const $datasource: unique symbol;
export type DatasourceKey<T> = string & {
  [$datasource]: T;
};
export interface Datasource<Args extends unknown[], T> {
  (...args: Args): DatasourceKey<T>;
  toString(): string;
}

const sources = new Map<string, Observable<any>>();

let keyCount = 0;
export const datasource = <Args extends unknown[], T>(resource: Resource<Args, T>): Datasource<Args, T> => {
  const id = `datasource__${++keyCount}`;
  const builder = (...args: Args): DatasourceKey<T> => {
    const key = `${id}:${stringify(args)}` as DatasourceKey<T>;
    if (!sources.has(key)) sources.set(key, resource(...args));

    return key;
  };

  return Object.assign(builder, {
    toString: () => id,
  });
};

export const getSource = <T>(datasource: DatasourceKey<T>): Observable<T> => {
  const $ = sources.get(datasource.toString());
  if (!$) throw new Error("This flowder has not been registered.");
  if (!isObservable($)) throw new Error("The registered Object is not an Observable.");

  return $ as Observable<T>;
};
