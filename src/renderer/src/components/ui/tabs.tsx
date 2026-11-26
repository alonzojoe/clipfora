import * as TabsPrimitive from '@radix-ui/react-tabs'
import type * as React from 'react'
import { cn } from '@renderer/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>): React.JSX.Element {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): React.JSX.Element {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-all focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>): React.JSX.Element {
  return (
    <TabsPrimitive.Content
      // an inactive panel keeps the `hidden` attribute, but a `flex` class would beat it and leave an empty panel
      // taking up space, so hide it explicitly, after the caller's classes
      className={cn('focus-visible:outline-hidden', className, 'data-[state=inactive]:hidden')}
      {...props}
    />
  )
}
