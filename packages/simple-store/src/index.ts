type Listener = () => void;

export interface SimpleStore<K, V> extends Map<K, V> {
  subscribe(listener: Listener): {
    unsubscribe(): void;
  };
}

class SimpleStoreImpl<K, V> extends Map<K, V> implements SimpleStore<K, V> {
  private listeners: Map<symbol, Listener> = new Map();
  set(key: K, value: V) {
    const r = super.set(key, value);
    this.runListeners();
    return r;
  }
  delete(key: K) {
    const r = super.delete(key);
    this.runListeners();
    return r;
  }
  clear() {
    const r = super.clear();
    this.runListeners();
    return r;
  }
  subscribe(listener: Listener) {
    const id = Symbol();
    this.listeners.set(id, listener);
    const unsubscribe = () => this.listeners.delete(id);

    return { unsubscribe };
  }

  private runListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export const createStore = <K, V>(): SimpleStoreImpl<K, V> => {
  return new SimpleStoreImpl();
};
