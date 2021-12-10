import { useContext, useEffect, useMemo, useState } from "react";
import { FlowContext } from "./context";

import type { Observable } from "rxjs";

export function useFlow<T>(key: string, $: Observable<T>): T | undefined;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue: U): T | U;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue?: U) {
  const context = useContext(FlowContext);
  if (context === null) throw new Error("FlowContext is not found");
  const initialState = useMemo(() => {
    const target = context.state.get(key);
    return target?.type === "success" ? target.payload : initialValue;
  }, [context.state, key, initialValue]);

  const [state, setState] = useState(initialState);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    context.register(key, $);

    return () => {
      context.lift(key);
    };
  }, [key, $, context]);

  useEffect(() => {
    const getInitialValue = (): T | U | undefined => {
      const target = context.state.get(key);
      return target?.type === "success" ? target.payload : initialValue;
    };

    setState(getInitialValue);
    let cache: T | U | undefined = getInitialValue();

    const d = context.state.subscribe(() => {
      const target = context.state.get(key);
      const next = getInitialValue();
      const update = (next: T | U | undefined) => {
        if (next === cache) return;
        cache = next;
        setState(next);
        setError(undefined);
      };

      if (target?.type === "success") return update(target.payload);
      if (target?.type === "error") return setError(target.payload);
      return update(next);
    });

    return () => {
      d.unsubscribe();
    };
  }, [context, initialState, key, $, initialValue]);

  if (error) throw error;
  return state;
}
