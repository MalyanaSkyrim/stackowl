import { Storage } from 'expo-sqlite/kv-store';
import { atomWithStorage } from 'jotai/utils';
import type { ZodType } from 'zod';

import type { StorageKey } from './keys';
import { createSchemaStorage, type KeyValueStore } from './storage';

/**
 * Key-value store on the phone, backed by expo-sqlite (its own database file). Reads are synchronous, so persisted atoms have their
 * saved value on the first render.
 */
const deviceStore: KeyValueStore = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};

/**
 * An atom saved on the phone. It reads the stored value when first used (no flash of the
 * default on cold start) and writes every change back.
 */
export function atomWithDeviceStorage<Value>(
  key: StorageKey,
  schema: ZodType<Value>,
  initialValue: Value
) {
  return atomWithStorage(key, initialValue, createSchemaStorage(deviceStore, schema), {
    getOnInit: true,
  });
}
