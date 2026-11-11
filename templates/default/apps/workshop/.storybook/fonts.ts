import plexArabicRegular from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular/IBMPlexSansArabic_400Regular.ttf'
import plexArabicMedium from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium/IBMPlexSansArabic_500Medium.ttf'
import plexArabicSemiBold from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold/IBMPlexSansArabic_600SemiBold.ttf'
import plexRegular from '@expo-google-fonts/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf'
import plexMedium from '@expo-google-fonts/ibm-plex-sans/500Medium/IBMPlexSans_500Medium.ttf'
import plexSemiBold from '@expo-google-fonts/ibm-plex-sans/600SemiBold/IBMPlexSans_600SemiBold.ttf'

/**
 * The fonts the design tokens name, registered under the same family names
 * the mobile app loads with expo-font (`useAppFonts`), so `font-sans`,
 * `font-arabic` and the rest render as on the phone.
 */
const FONTS: Record<string, string> = {
  IBMPlexSans_400Regular: plexRegular,
  IBMPlexSans_500Medium: plexMedium,
  IBMPlexSans_600SemiBold: plexSemiBold,
  IBMPlexSansArabic_400Regular: plexArabicRegular,
  IBMPlexSansArabic_500Medium: plexArabicMedium,
  IBMPlexSansArabic_600SemiBold: plexArabicSemiBold,
}

export function loadFonts() {
  for (const [family, url] of Object.entries(FONTS)) {
    const face = new FontFace(family, `url(${url})`)
    document.fonts.add(face)
    void face.load()
  }
}
