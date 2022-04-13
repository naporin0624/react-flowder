/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "@naporin0624/simple-store";
import stringify from "fast-json-stable-stringify";
import { Subscription, from, Observable, Subscribable, Unsubscribable, Observer, defer } from "rxjs";

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
    if (!sources.has(key)) {
      sources.set(key, resource(...args));
    }

    return key;
  };

  builder.toString = () => id;
  return builder;
};
export const fromPromise = <Args extends unknown[], T>(factory: (...args: Args) => Promise<T>): Datasource<Args, T> => {
  return datasource((...args: Args) => defer(() => from(factory(...args))));
};

export const getSource = <T>(datasource: DatasourceKey<T>): Observable<T> => {
  const $ = sources.get(datasource.toString());
  if (!$) throw new Error("This datasource has not been registered.");
  if (!($ instanceof Observable)) throw new Error("The registered Object is not an Observable.");

  return $ as Observable<T>;
};

export type Status<T = unknown> =
  | {
      type: "pending";
      data: Promise<T>;
    }
  | {
      type: "success";
      data: T;
    }
  | {
      type: "error";
      data: Error;
    };

export interface DatasourceResolver {
  register<T>(key: DatasourceKey<T>): void;
  cancel<T>(key: DatasourceKey<T>): void;
  cancelAll(): void;

  watchStatus<T>(key: DatasourceKey<T>): Subscribable<Status<T> | undefined>;
  getStatus<T>(key: DatasourceKey<T>): Status<T>;

  writeCache<T>(key: DatasourceKey<T>, value: Status<T>): void;

  resetCache(): void;
  resetCache<T>(key: DatasourceKey<T>): void;
  resetCache<Args extends unknown[], T>(key: Datasource<Args, T>): void;
  resetCache<Args extends unknown[], T>(key?: DatasourceKey<T> | Datasource<Args, T>): void;
}

export class DatasourceResolverImpl implements DatasourceResolver {
  constructor(private readonly subscriptions = new Map<DatasourceKey<unknown>, Subscription>(), private readonly cache = createStore<DatasourceKey<unknown>, Status<unknown>>()) {}

  register<T>(key: DatasourceKey<T>): void {
    // 二重登録はしない
    if (this.subscriptions.has(key)) return;

    const $ = getSource(key);
    const subscription = $.subscribe({
      next: (value) => {
        this.cache.set(key, { type: "success", data: value });
      },
      error: (error) => {
        this.cache.set(key, { type: "error", data: error });
      },
    });

    this.subscriptions.set(key, subscription);
  }
  cancel<T>(key: DatasourceKey<T>): void {
    const subscription = this.subscriptions.get(key);
    if (!subscription) return;

    subscription.unsubscribe();
    this.subscriptions.delete(key);
  }
  cancelAll(): void {
    this.subscriptions.forEach((value, key) => {
      this.cancel(key);
    });
  }

  watchStatus<T>(key: DatasourceKey<T>): Subscribable<Status<T>> {
    const subscribe = (observer: Partial<Observer<Status<T> | undefined>>): Unsubscribable => {
      const subscription = this.cache.subscribe((method, cacheKey) => {
        const cache = this.cache.get(key);
        if (cacheKey !== key && method !== "clear") return;

        observer.next?.(cache as Status<T> | undefined);
      });
      return {
        unsubscribe() {
          subscription.unsubscribe();
        },
      };
    };

    return { subscribe };
  }
  getStatus<T>(key: DatasourceKey<T>): Status<T> {
    const status = this.cache.get(key);
    if (!status) return this.getInitialData(key);

    return status as Status<T>;
  }

  writeCache<T>(key: DatasourceKey<T>, value: Status<T>): void {
    this.cache.set(key, value);
  }

  resetCache(): void;
  resetCache<T>(key: DatasourceKey<T>): void;
  resetCache<Args extends unknown[], T>(key: Datasource<Args, T>): void;
  resetCache<Args extends unknown[], T>(key?: DatasourceKey<T> | Datasource<Args, T>): void {
    if (typeof key === "string") {
      this.cache.delete(key);
      this.subscriptions.delete(key);
    } else if (typeof key === "function") {
      this.cache.forEach((v, k) => {
        if (k.startsWith(key.toString())) {
          this.cache.delete(k);
          this.subscriptions.delete(k);
        }
      });
    } else {
      this.cache.clear();
      this.subscriptions.clear();
    }
  }

  private getInitialData<T>(key: DatasourceKey<T>): Status<T> {
    const data = new Promise<T>((resolve, reject) => {
      const disposable = this.cache.subscribe((method, cacheKey) => {
        const cache = this.cache.get(key);
        if (key !== cacheKey || !cache) return;
        if (cache.type === "pending") return;
        if (cache.type === "success") resolve(cache.data as T);
        if (cache.type === "error") reject(cache.data);

        disposable.unsubscribe();
      });
    });
    return { type: "pending", data };
  }
}
