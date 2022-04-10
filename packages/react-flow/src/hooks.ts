import { useContext, useCallback, useMemo } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { FlowContext, Status } from "./context";

import type { Observable } from "rxjs";

export function useFlow<T>(key: string, $: Observable<T>): T | undefined;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue: U): T | U;
export function useFlow<T, U>(key: string, $: Observable<T>, initialValue?: U) {
  const context = useContext(FlowContext);
  if (context === null) throw new Error("FlowContext is not found");

  const subscribe = useCallback(
    (onSnapshot: () => void) => {
      context.register(key, $);
      const { unsubscribe } = context.state.subscribe((method, updateKey) => {
        if (updateKey === key || method === "clear") {
          onSnapshot();
        }
      });

      return () => {
        context.lift(key);
        unsubscribe();
      };
    },
    [$, context, key]
  );
  const initialStatus = useMemo<Status<U | undefined>>(() => ({ type: "success", payload: initialValue }), [initialValue]);
  const getSnapshot = useCallback((): Status<T | U | undefined> => context.state.get(key) ?? initialStatus, [context.state, initialStatus, key]);

  const { type, payload } = useSyncExternalStore(subscribe, getSnapshot);

  if (type === "error") throw payload;
  return payload;
}
