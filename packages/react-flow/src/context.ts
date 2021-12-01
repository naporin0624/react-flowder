import { createContext } from "react";
import { createStore, SimpleStore } from "@naporin0624/simple-store";

import type { Observable, Subscription } from "rxjs";

export interface FlowRoot {
  register(key: string, $: Observable<unknown>): void;
  lift(key: string): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: SimpleStore<string, any>;
}
export const FlowContext = createContext<FlowRoot | null>(null);
export const createFlowRoot = (): FlowRoot => {
  const counter = createStore<string, number>();
  const state = createStore<string, unknown>();
  const disposer = createStore<string, Subscription>();

  const register: FlowRoot["register"] = (key, $) => {
    const count = counter.get(key) ?? 0;
    counter.set(key, count + 1);
    if (count > 0) return;

    const dispose = $.subscribe((value) => {
      state.set(key, value);
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