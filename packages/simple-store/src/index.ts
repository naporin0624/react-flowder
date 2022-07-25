interface Listener<K> {
  (method: "set" | "delete" | "clear", key?: K): void;
}

export interface SimpleStore<K, V> extends Map<K, V> {
  subscribe(listener: Listener<K>): {
    unsubscribe(): void;
  };
}

class SimpleStoreImpl<K, V> extends Map<K, V> implements SimpleStore<K, V> {
  private listeners: Map<symbol, Listener<K>> = new Map();
  set(key: K, value: V) {
    const r = super.set(key, value);
    this.notify("set", key);
    return r;
  }
  delete(key: K) {
    const r = super.delete(key);
    this.notify("delete", key);
    return r;
  }
  clear() {
    const r = super.clear();
    this.notify("clear");
    return r;
  }
  subscribe(listener: Listener<K>) {
    const id = Symbol();
    this.listeners.set(id, listener);
    const unsubscribe = () => this.listeners.delete(id);

    return { unsubscribe };
  }

  private notify(method: "set" | "delete", key: K): void;
  private notify(method: "clear"): void;
  private notify(method: "set" | "delete" | "clear", key?: K): void;
  private notify(method: "set" | "delete" | "clear", key?: K): void {
    if (method === "clear") return this.listeners.forEach((listener) => listener(method));
    if (!key) return;

    this.listeners.forEach((listener) => {
      listener(method, key);
    });
  }
}

export const createStore = <K, V>(): SimpleStore<K, V> => {
  return new SimpleStoreImpl();
};
