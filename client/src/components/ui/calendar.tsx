import { DayPicker } from 'react-day-picker'
import * as React from 'react'
import { cn } from '../../lib/utils'

import 'react-day-picker/dist/style.css'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn('p-3', className)}
      // Use react-day-picker defaults for layout (alignment),
      // and only theme the accent color via CSS variables.
      style={
        {
          '--rdp-accent-color': '#D4AF37',
          '--rdp-accent-background-color': 'rgba(212,175,55,0.10)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

