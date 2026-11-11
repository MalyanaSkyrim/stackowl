import type * as React from 'react'

export type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Heights the sheet can rest at, e.g. ['50%', '90%']. Ignored with dynamic sizing. */
  snapPoints?: (number | `${number}%`)[]
  /** Size the sheet to its content instead of `snapPoints`. */
  enableDynamicSizing?: boolean
  /** Scroll the content when it is taller than the sheet. */
  scrollable?: boolean
  /**
   * Dim the page behind the sheet and close it on a tap there (the default). Without it the
   * sheet peeks over the page, which stays scrollable and tappable.
   */
  backdrop?: boolean
  /**
   * Pinned above the content, which then scrolls under it on its own (a title and a search
   * field over a long list). The content scrolls whether or not `scrollable` is set.
   */
  header?: React.ReactNode
  /** With `header`: the children (by position) that stay pinned at the top while the rest scrolls. */
  stickyHeaderIndices?: number[]
  /** Pinned under the content, e.g. action buttons. */
  footer?: React.ReactNode
  className?: string
  children?: React.ReactNode
}
