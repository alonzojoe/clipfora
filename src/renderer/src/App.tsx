import type * as React from 'react'
import { useEffect, useState } from 'react'
import { Preview } from '@renderer/components/editor/Preview'
import { PromptPanel } from '@renderer/components/editor/PromptPanel'
import { ResourceBin } from '@renderer/components/editor/ResourceBin'
import { Timeline } from '@renderer/components/editor/Timeline'
import { TitleBar } from '@renderer/components/editor/TitleBar'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { usePlayer } from '@renderer/hooks/usePlayer'
import { useWorkspace } from '@renderer/hooks/useWorkspace'

/** One frame at 30 fps, the step of the arrow keys. */
const FRAME = 1 / 30

export default function App(): React.JSX.Element {
  const ws = useWorkspace()
  const resources = ws.workspace?.resources ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // nothing picked yet (or the picked file was removed): show the first one
  const selected = resources.find((r) => r.id === selectedId) ?? resources[0] ?? null
  const playable = selected && !selected.missing && selected.kind !== 'image' ? selected : null

  const { video, clock, playing, duration, seek, toggle } = usePlayer(playable?.url ?? null)

  // Space = play or pause, Home / End = start / end, ← / → = one frame (⇧ = one second), unless typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target
      if (t instanceof Element && t.closest('input, textarea, select, button, [contenteditable]'))
        return
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        seek(e.key === 'Home' ? 0 : duration)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        seek(clock.get() + (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 1 : FRAME))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clock, duration, seek, toggle])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col">
        <TitleBar onImport={ws.pick} />
        <div className="flex min-h-0 flex-1">
          <ResourceBin
            workspace={ws.workspace}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            onImportPaths={ws.importPaths}
            onPick={ws.pick}
            onRemove={ws.remove}
            onInfo={ws.setInfo}
          />
          <Preview
            resource={selected}
            video={video}
            clock={clock}
            playing={playing}
            duration={duration}
            onSeek={seek}
            onToggle={toggle}
          />
          <PromptPanel workspace={ws.workspace} onPrompt={ws.setPrompt} />
        </div>
        <Timeline resource={playable} clock={clock} duration={duration} onSeek={seek} />
      </div>
    </TooltipProvider>
  )
}
