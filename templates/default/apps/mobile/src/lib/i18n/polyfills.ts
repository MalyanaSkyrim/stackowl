// Hermes has no Intl.Locale and no Intl.PluralRules, which react-intl needs for
// `{count, plural, …}` messages. The plural rules use Intl.Locale to match a regional tag
// (the device's `fr-MA`) to an app language, so Intl.Locale comes first: the order matters.
// Forced rather than conditional, so the phone and the tests (Node has its own) use the same
// code. One plural locale-data import per app language (`localeSchema` in
// src/lib/store/language.ts).
import '@formatjs/intl-locale/polyfill-force.js';
import '@formatjs/intl-pluralrules/polyfill-force.js';
import '@formatjs/intl-pluralrules/locale-data/ar.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/fr.js';
