import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "./context";

import type { Observable } from "rxjs";

export function useFlow<T>(key: string, $: Observable<T>): T | undefined;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue: U): T | U;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue?: U) {
  const context = useContext(FlowContext);
  if (context === null) throw new Error("FlowContext is not found");
  const initialState = useMemo(() => (context.state.has(key) ? context.state.get(key) : initialValue), [context.state, initialValue, key]);

  const [state, setState] = useState(initialState);

  useEffect(() => {
    context.register(key, $);

    return () => {
      context.lift(key);
    };
  }, [key, $, context]);

  useEffect(() => {
    let cache: T | U | undefined = initialState;
    const d = context.state.subscribe(() => {
      const has = context.state.has(key);
      const next = has ? context.state.get(key) : initialValue;

      if (next === cache) return;
      cache = next;
      setState(next);
    });

    return () => {
      d.unsubscribe();
    };
  }, [context.state, initialState, initialValue, key]);

  return state;
}
