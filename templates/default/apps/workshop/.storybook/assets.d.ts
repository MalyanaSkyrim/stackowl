/** Vite turns an imported font file into its URL. */
declare module '*.ttf' {
  const url: string
  export default url
}
