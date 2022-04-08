import { createContext } from "react";
import { createStore, SimpleStore } from "@naporin0624/simple-store";

import type { Observable, Subscription } from "rxjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Status<T = any> =
  | {
      type: "success";
      payload: T;
    }
  | {
      type: "error";
      payload: Error;
    };

export interface FlowRoot {
  register(key: string, $: Observable<unknown>): void;
  lift(key: string): void;
  state: SimpleStore<string, Status>;
}
export const FlowContext = createContext<FlowRoot | null>(null);
FlowContext.displayName = "FlowContext";

type Props = {
  state?: SimpleStore<string, Status>;
  counter?: Map<string, number>;
  disposer?: Map<string, Subscription>;
};

export const createFlowRoot = (props?: Props): FlowRoot => {
  const state = props?.state ?? createStore<string, Status>();
  const counter = props?.counter ?? new Map<string, number>();
  const disposer = props?.disposer ?? new Map<string, Subscription>();

  const register: FlowRoot["register"] = (key, $) => {
    const count = counter.get(key) ?? 0;
    counter.set(key, count + 1);
    if (count > 0) return;

    const dispose = $.subscribe({
      next(value) {
        state.set(key, { type: "success", payload: value });
      },
      error(err) {
        state.set(key, { type: "error", payload: err });
      },
    });
    disposer.set(key, dispose);
  };

  const lift: FlowRoot["lift"] = (key) => {
    const count = (counter.get(key) ?? 0) - 1;
    counter.set(key, Math.max(count, 0));
    if (count > 0) return;

    disposer.get(key)?.unsubscribe();
    state.delete(key);
    disposer.delete(key);
  };

  return { state, register, lift };
};
