---
name: arabic-rtl
description: Rules that keep mobile screens and kit components correct in Arabic (right to left). Use whenever you add or change a screen in apps/mobile or a component in packages/ui, and whenever a bug mentions Arabic, RTL, alignment, mirrored icons or a label that stays in English.
---

# Arabic and right to left

The app ships in English, French and Arabic. Arabic is right to left, so every screen has to work mirrored. Follow these rules while you build, not as a fix afterwards.

## When to Use

- Adding or changing any screen in `apps/mobile` or any component in `packages/ui`
- Adding an icon that points somewhere (back, forward, disclosure)
- Showing content that is always left to right (emails, phone numbers, codes)
- Fixing a bug that only shows in Arabic

## How RTL works here

- Picking Arabic in Settings → Language calls `I18nManager.forceRTL(true)` and reloads the app (`app/profile/language.tsx`). After the reload `I18nManager.isRTL` is `true` and React Native flips every `flex-row`, `ms-`/`me-`, `start-`/`end-` on its own.
- Text direction does **not** follow `I18nManager` on iOS: it follows the app bundle's language, which is English. The kit `Text` fixes this: `I18nProvider` mounts `TextScriptProvider script="arabic"` for Arabic, and the kit `Text` then sets `writingDirection: 'rtl'` and the Arabic font.
- So layout flips for free, and text is right only when it goes through the kit `Text`.

## Rules

### 1. Text comes from the kit

Every visible string uses `Text` from `@starter/ui`, never `Text` from `react-native`. React Native's `Text` stays left-aligned in Arabic on iOS and keeps the Latin font.

```tsx
// ✅
import { Text } from '@starter/ui';
<Text className="text-2xl font-bold">{t('welcome')}</Text>

// ❌ left-aligned and Latin font in Arabic
import { Text } from 'react-native';
```

Use the kit `Input`, `Button`, `Label` and the other kit components for the same reason.

### 2. Logical spacing and position classes

Use start/end classes; they flip in Arabic. Left/right classes don't.

| ✅ Use                        | ❌ Avoid                      |
| ----------------------------- | ----------------------------- |
| `ms-4` `me-4` `ps-4` `pe-4`   | `ml-4` `mr-4` `pl-4` `pr-4`   |
| `start-0` `end-0`             | `left-0` `right-0`            |
| `border-s` `border-e`         | `border-l` `border-r`         |
| `rounded-s-lg` `rounded-e-lg` | `rounded-l-lg` `rounded-r-lg` |

`px-`, `mx-`, `inset-x-` are symmetric and fine. In a `style` prop use `marginStart`, `paddingEnd`, `start`, `end` instead of `marginLeft`, `paddingRight`, `left`, `right`.

### 3. Leave text alignment alone

Don't add `text-left` or `text-right`; the default alignment follows the language. `text-center` is fine.

### 4. Don't fake RTL with `flex-row-reverse`

`flex-row` already runs right to left in Arabic. Adding `flex-row-reverse` (or picking it from `I18nManager.isRTL`) flips the row twice. Use `flex-row-reverse` only when the order must be reversed in **every** language.

### 5. Directional icons follow the reading direction

An icon that points somewhere is picked from `I18nManager.isRTL`, once, at module level:

```tsx
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native'
import { I18nManager } from 'react-native'

// Back points toward the start of the screen: left, or right in Arabic.
const BackArrow = I18nManager.isRTL ? ArrowRight : ArrowLeft
// Forward and disclosure chevrons point toward the end.
const ForwardChevron = I18nManager.isRTL ? ChevronLeft : ChevronRight
```

Examples: `MenuList` (`packages/ui/src/components/MenuList/index.tsx`), `AuthHeader` (`apps/mobile/src/components/auth/AuthHeader.tsx`). Icons that don't point (close X, check, globe, lock, play/pause of media) never flip.

### 6. Left-to-right content opts out

Emails, phone numbers, URLs and codes always read left to right. In an Arabic paragraph, bidi can reorder the digit groups of `+33 6 12 34 56`. Mark them:

```tsx
{
  /* An address and a phone number always read left to right. */
}
;<Text script="latin">{t('supportPhoneDisplay')}</Text>
```

A row that must keep its order (OTP boxes) reverses the flip on purpose, as `packages/ui/src/components/OtpInput/index.tsx` does.

A number followed by Latin letters takes no space in Arabic (`45m`, `1h 15m`). In right-to-left text a space splits the run, so `1 h 15 min` shows out of order.

### 7. System-localized native controls

Native controls that bring their own label (Apple's `AppleAuthenticationButton`, some system pickers) take their language from the phone, not from the app's language setting. When the label has to follow the app language, draw the control with kit components and a translated string, like `AppleSignInButton` in `apps/mobile/lib/native/AppleSignIn.tsx`.

### 8. Every string in three languages

Add each key to `src/lib/i18n/messages/en.json`, `fr.json` and `ar.json`. Keep brand names (Apple, Google, `brand.displayName`) in Latin script inside the Arabic sentence.

### 9. Arabic headings need a taller line

Arabic letters carry marks above and below, so Arabic headings need a taller line than Latin ones at the same size, or iOS cuts them at the top. Use the `Text` variants (`display`, `h1`, `h2`) or `font-display` with `text-display`, `text-title-lg` or `text-title-md`: the kit's `Text` swaps these for their `-ar` sizes. A new heading size needs its own `-ar` token in `packages/design-tokens/src/tokens.ts` and an entry in `DISPLAY_AR_SIZE` in `packages/ui/src/components/Text/index.tsx`.

## Checklist before you finish

1. Switch the app to Arabic (Settings → Language → العربية). It reloads.
2. On each screen you touched check: text sits on the right, rows run right to left, back arrows point right, chevrons point left, nothing hugs the wrong edge.
3. Check strings that mix Arabic and Latin (brand names, emails, numbers) read in the right order.
4. Switch back to English and check the screen once more.
