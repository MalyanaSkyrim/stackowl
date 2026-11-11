'use client'

import DateTimePicker from '@react-native-community/datetimepicker'
import * as React from 'react'
import { View } from 'react-native'

import { useThemeScheme, useTokenColor } from '../../lib/token-colors'
import { cn } from '../../lib/utils'
import type { TimeOfDay, TimePickerProps } from './TimePicker.types'

export type { TimeOfDay, TimePickerProps } from './TimePicker.types'

/** Any fixed day: the wheel only shows the time. */
const asDate = (time: TimeOfDay) => new Date(2000, 0, 1, time.hour, time.minute)

const minutesOf = (time: TimeOfDay) => time.hour * 60 + time.minute

/**
 * The phone's own time wheel. iOS takes its 12- or 24-hour format from a locale, so `hourCycle`
 * picks one: en_GB for 24-hour, and `locale` (or en_US) for 12-hour with AM/PM. The web build
 * (`index.web.tsx`) shows typed fields with the same props.
 */
function TimePicker({
  value,
  onChange,
  hourCycle,
  minuteInterval,
  maximum,
  locale,
  className,
  ...props
}: TimePickerProps) {
  const scheme = useThemeScheme()
  const color = useTokenColor()

  return (
    <View className={cn('items-center', className)}>
      <DateTimePicker
        mode="time"
        display="spinner"
        value={asDate(value)}
        locale={hourCycle === '24' ? 'en_GB' : (locale ?? 'en_US')}
        is24Hour={hourCycle === '24'}
        minuteInterval={minuteInterval}
        maximumDate={maximum ? asDate(maximum) : undefined}
        themeVariant={scheme}
        textColor={color('foreground')}
        accessibilityLabel={props['aria-label']}
        onChange={(_event, date) => {
          if (!date) return
          const picked = { hour: date.getHours(), minute: date.getMinutes() }
          onChange(
            maximum && minutesOf(picked) > minutesOf(maximum)
              ? maximum
              : picked,
          )
        }}
      />
    </View>
  )
}

export { TimePicker }
