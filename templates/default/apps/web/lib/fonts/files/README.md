# Web fonts

The website's fonts, served by `next/font/local` (`../index.ts`). Each file is
the subset Google Fonts serves for that family and weight (`latin` or `arabic`),
downloaded from fonts.googleapis.com on 2026-11-05.

| File                           | Family               | Licence                   |
| ------------------------------ | -------------------- | ------------------------- |
| `ibm-plex-sans-latin-*.woff2`  | IBM Plex Sans        | SIL Open Font License 1.1 |
| `ibm-plex-sans-arabic-*.woff2` | IBM Plex Sans Arabic | SIL Open Font License 1.1 |

To add a weight, download the subset from
`https://fonts.googleapis.com/css2?family=<Family>:wght@<weight>` (the `src` of
its `/* latin */` or `/* arabic */` block) and list it in `../index.ts`.
