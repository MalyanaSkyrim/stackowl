'use client'

import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Input } from '../Input'
import { Text } from '../Text'
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup'
import type { TimeOfDay, TimePickerProps } from './TimePicker.types'

export type { TimeOfDay, TimePickerProps } from './TimePicker.types'

const DEFAULT_LABELS = {
  hours: 'Hours',
  minutes: 'Minutes',
  am: 'AM',
  pm: 'PM',
}

const pad = (value: number) => String(value).padStart(2, '0')
const minutesOf = (time: TimeOfDay) => time.hour * 60 + time.minute

/**
 * Web build of the time picker: the browser has no time wheel, so hours and minutes are typed,
 * with AM/PM in 12-hour format. Same props as the native one; a time is only sent once valid.
 */
function TimePicker({
  value,
  onChange,
  hourCycle,
  maximum,
  labels = DEFAULT_LABELS,
  className,
  ...props
}: TimePickerProps) {
  const is12Hour = hourCycle === '12'
  const shownHour = is12Hour
    ? String(((value.hour + 11) % 12) + 1)
    : pad(value.hour)
  const [hourText, setHourText] = React.useState(shownHour)
  const [minuteText, setMinuteText] = React.useState(pad(value.minute))
  const isPm = value.hour >= 12

  React.useEffect(() => {
    setHourText(shownHour)
    setMinuteText(pad(value.minute))
  }, [shownHour, value.minute])

  const send = (hourInput: string, minuteInput: string, pm: boolean) => {
    const hour = Number(hourInput)
    const minute = Number(minuteInput)
    if (!/^\d{1,2}$/.test(hourInput) || !/^\d{1,2}$/.test(minuteInput)) return
    if (is12Hour ? hour < 1 || hour > 12 : hour > 23) return
    if (minute > 59) return
    const time = { hour: is12Hour ? (hour % 12) + (pm ? 12 : 0) : hour, minute }
    onChange(maximum && minutesOf(time) > minutesOf(maximum) ? maximum : time)
  }

  return (
    <View
      aria-label={props['aria-label']}
      className={cn('flex-row items-center justify-center gap-2', className)}
      style={{ direction: 'ltr' }}>
      <Input
        className="text-title-lg h-16 w-20 text-center font-semibold"
        inputMode="numeric"
        maxLength={2}
        value={hourText}
        accessibilityLabel={labels.hours}
        onChangeText={(text) => {
          setHourText(text)
          send(text, minuteText, isPm)
        }}
      />
      <Text className="text-title-lg font-semibold">:</Text>
      <Input
        className="text-title-lg h-16 w-20 text-center font-semibold"
        inputMode="numeric"
        maxLength={2}
        value={minuteText}
        accessibilityLabel={labels.minutes}
        onChangeText={(text) => {
          setMinuteText(text)
          send(hourText, text, isPm)
        }}
      />
      {is12Hour ? (
        <ToggleGroup
          type="single"
          variant="segmented"
          className="ms-2 w-28"
          value={isPm ? 'pm' : 'am'}
          onValueChange={(next) => {
            if (next === 'am' || next === 'pm')
              send(hourText, minuteText, next === 'pm')
          }}>
          <ToggleGroupItem value="am" className="px-1">
            <Text>{labels.am}</Text>
          </ToggleGroupItem>
          <ToggleGroupItem value="pm" className="px-1">
            <Text>{labels.pm}</Text>
          </ToggleGroupItem>
        </ToggleGroup>
      ) : null}
    </View>
  )
}

export { TimePicker }
