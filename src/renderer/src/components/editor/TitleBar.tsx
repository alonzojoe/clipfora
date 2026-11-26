import { Plus } from 'lucide-react'
import type * as React from 'react'
import logo from '@renderer/assets/logo.svg'
import { Button } from '@renderer/components/ui/button'
import { ThemeSwitch } from './ThemeSwitch'

/** The window's own title bar: drag it to move the window. The left padding leaves room for the traffic lights. */
export function TitleBar({ onImport }: { onImport: () => void }): React.JSX.Element {
  return (
    <header className="titlebar-drag flex h-[52px] shrink-0 items-center gap-3 border-b bg-titlebar pr-3 pl-[84px]">
      <div className="flex items-center gap-2">
        <img src={logo} alt="" className="h-6 w-6" draggable={false} />
        <span className="whitespace-nowrap font-semibold text-lg tracking-tight">
          Clip<span className="text-primary">fora</span>
        </span>
      </div>
      <span className="rounded-full border border-input px-2 py-0.5 text-muted-foreground text-xs">
        9:16 · 1080 × 1920
      </span>
      <div className="flex-1" />
      <ThemeSwitch />
      <Button className="no-drag font-semibold" onClick={onImport}>
        <Plus />
        Import
      </Button>
    </header>
  )
}
