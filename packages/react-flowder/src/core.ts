/* eslint-disable @typescript-eslint/no-explicit-any */
import stringify from "fast-json-stable-stringify";
import { from, isObservable, Observable } from "rxjs";

type Resource<Args extends unknown[], T> = (...args: Args) => Observable<T> | Promise<T>;

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
    const r = resource(...args);
    if (!sources.has(key)) {
      if (r instanceof Promise) sources.set(key, from(r));
      else sources.set(key, r);
    }

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
