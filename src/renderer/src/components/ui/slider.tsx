import * as SliderPrimitive from '@radix-ui/react-slider'
import type * as React from 'react'
import { cn } from '@renderer/lib/utils'

/** One-thumb slider. `aria-label` names the thumb, which is the element a screen reader lands on. */
export function Slider({
  className,
  'aria-label': label,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>): React.JSX.Element {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex h-4 touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-input">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={label}
        className="block h-3 w-3 rounded-full bg-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50"
      />
    </SliderPrimitive.Root>
  )
}
