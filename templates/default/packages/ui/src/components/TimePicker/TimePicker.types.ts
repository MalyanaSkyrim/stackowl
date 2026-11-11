/** A time of day, without a date. */
export type TimeOfDay = { hour: number; minute: number }

export type TimePickerProps = {
  value: TimeOfDay
  onChange: (value: TimeOfDay) => void
  /** 24-hour, or 12-hour with AM/PM. */
  hourCycle: '12' | '24'
  /** The wheel's step in minutes, e.g. 5. */
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30
  /** The latest time that can be picked; a later one snaps back to it. */
  maximum?: TimeOfDay
  /**
   * The language of the AM/PM labels on the phone, e.g. "ar" for ص / م. Ignored in 24-hour
   * format and on the web.
   */
  locale?: string
  /** The web fields' labels, which the kit can't translate. */
  labels?: { hours: string; minutes: string; am: string; pm: string }
  'aria-label'?: string
  className?: string
}
