import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@renderer/lib/utils'

const variants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        outline: 'border border-input bg-transparent shadow-xs hover:bg-accent',
        secondary: 'bg-secondary text-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent'
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2.5 text-xs',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
)

type Props = React.ComponentProps<'button'> & VariantProps<typeof variants>

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: Props): React.JSX.Element {
  return <button type={type} className={cn(variants({ variant, size, className }))} {...props} />
}
