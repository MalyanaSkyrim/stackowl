import {
  compareTranslationKeys,
  type TranslationObject,
} from '@starter/common'
import { describe, it, expect } from 'vitest'

import enJson from './en.json'
import frJson from './fr.json'

const en = enJson as TranslationObject

const targets = {
  French: { file: 'fr.json', messages: frJson as TranslationObject },
}

const emptyMessages = (messages: TranslationObject, prefix = ''): string[] =>
  Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'string'
      ? value.trim() === ''
        ? [`${prefix}${key}`]
        : []
      : emptyMessages(value, `${prefix}${key}.`),
  )

describe('Web Translation Consistency', () => {
  it.each(Object.entries(targets))(
    'should have the same keys in English and %s',
    (language, { file, messages }) => {
      const { missingInTarget, missingInReference } = compareTranslationKeys(
        en,
        messages,
      )

      expect(
        missingInTarget,
        `Keys existing in English but missing in ${language} (${file})`,
      ).toEqual([])
      expect(
        missingInReference,
        `Keys existing in ${language} but missing in English (en.json)`,
      ).toEqual([])
    },
  )

  it('should have no empty messages', () => {
    const empty = [
      en,
      ...Object.values(targets).map((t) => t.messages),
    ].flatMap((messages) => emptyMessages(messages))
    expect(empty).toEqual([])
  })
})
