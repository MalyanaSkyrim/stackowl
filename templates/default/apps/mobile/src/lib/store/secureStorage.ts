import * as SecureStore from 'expo-secure-store';
import { atomWithStorage } from 'jotai/utils';
import type { ZodType } from 'zod';

import type { SecureStorageKey } from './keys';
import { createSchemaStorage, type KeyValueStore } from './storage';

/**
 * The iOS Keychain, through expo-secure-store. Reads and writes are synchronous like the
 * device store, so a secure atom also has its saved value on the first render. Only for
 * secrets such as the session tokens: the Keychain is slower and holds small values.
 */
const secureStore: KeyValueStore = {
  getItem: (key) => SecureStore.getItem(key),
  setItem: (key, value) => SecureStore.setItem(key, value),
  removeItem: (key) => {
    // There is no synchronous delete; nothing reads the key until it resolves.
    void SecureStore.deleteItemAsync(key);
  },
};

/** An atom saved in the Keychain. Same behavior as `atomWithDeviceStorage`. */
export function atomWithSecureStorage<Value>(
  key: SecureStorageKey,
  schema: ZodType<Value>,
  initialValue: Value
) {
  return atomWithStorage(key, initialValue, createSchemaStorage(secureStore, schema), {
    getOnInit: true,
  });
}
