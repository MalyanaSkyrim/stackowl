import { describe, expect, it } from 'vitest';
import { createStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { z } from 'zod';

import { createSchemaStorage, type KeyValueStore } from './storage';

function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  values: Map<string, string>;
} {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

const localeSchema = z.enum(['en', 'fr', 'ar']);

describe('createSchemaStorage', () => {
  it('returns the stored value when it matches the schema', () => {
    const storage = createSchemaStorage(createMemoryStore({ lang: '"fr"' }), localeSchema);
    expect(storage.getItem('lang', 'en')).toBe('fr');
  });

  it('falls back to the initial value when nothing is stored', () => {
    const storage = createSchemaStorage(createMemoryStore(), localeSchema);
    expect(storage.getItem('lang', 'en')).toBe('en');
  });

  it('falls back to the initial value when the stored value no longer matches', () => {
    const storage = createSchemaStorage(createMemoryStore({ lang: '"de"' }), localeSchema);
    expect(storage.getItem('lang', 'en')).toBe('en');
  });

  it('falls back to the initial value when the stored value is not JSON', () => {
    const storage = createSchemaStorage(createMemoryStore({ lang: 'fr' }), localeSchema);
    expect(storage.getItem('lang', 'en')).toBe('en');
  });

  it('saves values as JSON and removes them', () => {
    const memory = createMemoryStore();
    const storage = createSchemaStorage(memory, z.boolean());
    storage.setItem('done', true);
    expect(memory.values.get('done')).toBe('true');
    storage.removeItem('done');
    expect(memory.values.has('done')).toBe(false);
  });
});

describe('persisted atom', () => {
  it('has the stored value on first read and writes changes back', () => {
    const memory = createMemoryStore({ lang: '"ar"' });
    const languageAtom = atomWithStorage('lang', 'en', createSchemaStorage(memory, localeSchema), {
      getOnInit: true,
    });
    const store = createStore();

    expect(store.get(languageAtom)).toBe('ar');

    store.set(languageAtom, 'fr');
    expect(memory.values.get('lang')).toBe('"fr"');
  });
});
