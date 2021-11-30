import { useContext, useEffect, useState } from "react";
import { FlowContext } from "./context";

import type { Observable } from "rxjs";

export const useFlow = <T>(key: string, $: Observable<T>): T | undefined => {
  const context = useContext(FlowContext);
  if (context === null) throw new Error("FlowContext is not found");
  const [state, setState] = useState(context.state.get(key));

  useEffect(() => {
    context.register(key, $);

    return () => {
      context.lift(key);
    };
  }, [key, $, context]);

  useEffect(() => {
    const cache: T | undefined = context.state.get(key);
    const d = context.state.subscribe(() => {
      const next = context.state.get(key);
      if (next === cache) return;
      setState(next);
    });

    return () => {
      d.unsubscribe();
    };
  }, [context.state, key]);

  return state;
};
