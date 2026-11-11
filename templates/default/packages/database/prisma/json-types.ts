import type {
  OAuthProvider as OAuthProviderValue,
  OtpPurpose as OtpPurposeValue,
} from '@starter/common'

export {}

declare global {
  // Declare the shapes of your `Json` columns, and the allowed values of
  // `String` columns (zod enums from `@starter/common`), here and reference
  // them from the schema with `/// [TypeName]` (see prisma-json-types-generator).
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type Metadata = Record<string, string | number | boolean | null>
    type OAuthProvider = OAuthProviderValue
    type OtpPurpose = OtpPurposeValue
  }
}
