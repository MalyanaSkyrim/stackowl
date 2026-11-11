// Tests only. Node has the whole of Intl; the phone's Hermes has only Collator,
// DateTimeFormat, NumberFormat and getCanonicalLocales. Import this before `./polyfills` so a
// test runs against what the phone has and fails the way the phone would.
const MISSING_ON_HERMES = [
  'Locale',
  'PluralRules',
  'RelativeTimeFormat',
  'ListFormat',
  'DisplayNames',
  'Segmenter',
  'supportedValuesOf',
] as const;

for (const name of MISSING_ON_HERMES) {
  Reflect.deleteProperty(Intl, name);
}
