import { useContext, useEffect, useState } from "react";
import { FlowContext } from "./context";

import type { Observable } from "rxjs";

export function useFlow<T>(key: string, $: Observable<T>): T | undefined;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue: U): T | U;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue?: U) {
  const context = useContext(FlowContext);
  if (context === null) throw new Error("FlowContext is not found");
  const [state, setState] = useState(initialValue ?? context.state.get(key));

  useEffect(() => {
    context.register(key, $);

    return () => {
      context.lift(key);
    };
  }, [key, $, context]);

  useEffect(() => {
    let cache: T | U | undefined = initialValue ?? context.state.get(key);
    const d = context.state.subscribe(() => {
      const next = context.state.get(key);
      if (next === cache) return;
      cache = next;
      setState(next);
    });

    return () => {
      d.unsubscribe();
    };
  }, [context.state, initialValue, key]);

  return state;
}
