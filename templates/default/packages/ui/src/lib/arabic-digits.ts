const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/**
 * A number in Arabic-Indic digits (٢٨٦), for numbers shown in Arabic text.
 */
export function arabicDigits(value: number): string {
  return String(value).replace(
    /\d/g,
    (digit) => ARABIC_DIGITS[Number(digit)] ?? digit,
  )
}
