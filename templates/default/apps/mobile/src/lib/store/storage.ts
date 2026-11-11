import type { ZodType } from 'zod';

/** A synchronous string key-value store, such as the SQLite one on the phone. */
export type KeyValueStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

/**
 * JSON storage for Jotai's `atomWithStorage`. Values are checked against `schema` when read,
 * so a missing, unreadable or outdated value falls back to the atom's initial value
 * instead of reaching the UI.
 */
export function createSchemaStorage<Value>(store: KeyValueStore, schema: ZodType<Value>) {
  return {
    getItem: (key: string, initialValue: Value): Value => {
      try {
        const raw = store.getItem(key);
        if (raw === null) {
          return initialValue;
        }
        const result = schema.safeParse(JSON.parse(raw));
        return result.success ? result.data : initialValue;
      } catch (error) {
        console.error(`[storage] Could not read "${key}":`, error);
        return initialValue;
      }
    },
    setItem: (key: string, value: Value): void => {
      store.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string): void => {
      store.removeItem(key);
    },
  };
}
