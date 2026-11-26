import { FastForward, Music, Pause, Play, Rewind, SkipBack, SkipForward } from 'lucide-react'
import type * as React from 'react'
import { memo, type RefObject, useLayoutEffect, useRef, useState } from 'react'
import type { Resource } from '../../../../shared/types'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { type Clock, useTime } from '@renderer/hooks/usePlayer'
import { fmtTime } from '@renderer/lib/format'
import { cn } from '@renderer/lib/utils'

const W = 1080
const H = 1920
const STEPS = ['Import a long video', 'Add the campaign info', 'Write the clipping prompt']

type Props = {
  resource: Resource | null
  /** the element usePlayer drives; it plays audio files too */
  video: RefObject<HTMLVideoElement | null>
  /** the playhead: only the readout subscribes, so playback does not re-render the panel */
  clock: Clock
  playing: boolean
  duration: number
  onSeek: (t: number) => void
  onToggle: () => void
}

function TimeReadout({ clock, duration }: { clock: Clock; duration: number }): React.JSX.Element {
  const time = useTime(clock)
  return (
    <span className="tabular font-mono text-foreground text-xs">
      {fmtTime(time)} <span className="text-muted-foreground">/ {fmtTime(duration)}</span>
    </span>
  )
}

/** Center panel: the open resource inside a 9:16 frame, the shape every clip is exported in. */
export const Preview = memo(function Preview(props: Props): React.JSX.Element {
  const { resource, video, clock, playing, duration, onSeek, onToggle } = props
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.25)
  const [safe, setSafe] = useState(true)
  const [fill, setFill] = useState(true)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setScale(Math.max(0.05, Math.min((width - 32) / W, (height - 32) / H)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = W * scale
  const h = H * scale
  const usable = resource && !resource.missing
  const playable = !!usable && resource.kind !== 'image'
  const fit = fill ? 'object-cover' : 'object-contain'

  return (
    <main aria-label="Preview" className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="flex h-10 shrink-0 items-center gap-3 border-subtle border-b px-3.5 text-muted-foreground text-xs">
        <span className="font-semibold text-foreground">Preview</span>
        <span className="truncate">{resource ? resource.name : '1080 × 1920'}</span>
        <div className="flex-1" />
        <label className="flex shrink-0 items-center gap-2">
          <Switch checked={fill} onCheckedChange={setFill} aria-label="Fill the 9:16 frame" />
          Fill frame
        </label>
        <label className="flex shrink-0 items-center gap-2">
          <Switch checked={safe} onCheckedChange={setSafe} aria-label="Show safe zones" />
          Safe zones
        </label>
      </div>

      <div ref={box} className="relative flex min-h-0 flex-1 items-center justify-center">
        {usable ? (
          <div
            className="relative overflow-hidden rounded-xl bg-black shadow-[0_0_0_1px_var(--border),0_30px_60px_rgba(0,0,0,.35)]"
            style={{ width: w, height: h }}
          >
            {resource.kind === 'image' ? (
              <img
                src={resource.url}
                alt={resource.name}
                draggable={false}
                className={cn('h-full w-full', fit)}
              />
            ) : (
              // biome-ignore lint/a11y/useMediaCaption: the user's own source footage, there is no caption track to offer
              <video
                ref={video}
                src={resource.url}
                playsInline
                className={cn('h-full w-full', fit)}
              />
            )}
            {resource.kind === 'audio' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-sky">
                <Music className="h-8 w-8" />
                <span className="text-muted-foreground text-xs">Audio only</span>
              </div>
            )}
            {safe && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {/* where the platforms draw their own UI: top 200px, bottom 350px, right 120px between y 1000 and 1700 */}
                <div
                  className="absolute inset-x-0 top-0 border-primary border-b border-dashed bg-primary/15"
                  style={{ height: 200 * scale }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 border-primary border-t border-dashed bg-primary/15"
                  style={{ height: 350 * scale }}
                />
                <div
                  className="absolute right-0 border-primary border-l border-dashed bg-primary/15"
                  style={{ top: 1000 * scale, height: 700 * scale, width: 120 * scale }}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-input border-dashed p-6 text-center"
            style={{ width: w, height: h }}
          >
            <div className="font-semibold text-[15px]">
              {resource ? 'This file is no longer where it was' : 'Your clip appears here'}
            </div>
            {resource ? (
              <p className="select-text break-all text-muted-foreground text-xs">{resource.path}</p>
            ) : (
              <ol className="flex flex-col gap-3 text-left text-sm">
                {STEPS.map((t, i) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-xs',
                        i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      )}
                    >
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      <div className="flex h-[50px] shrink-0 items-center justify-center gap-3 border-subtle border-t">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go to start"
          title="Start (Home)"
          onClick={() => onSeek(0)}
          disabled={!playable}
        >
          <SkipBack />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back 1 second"
          title="Back 1s (⇧←)"
          onClick={() => onSeek(clock.get() - 1)}
          disabled={!playable}
        >
          <Rewind />
        </Button>
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          title="Play or pause (Space)"
          onClick={onToggle}
          disabled={!playable}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Forward 1 second"
          title="Forward 1s (⇧→)"
          onClick={() => onSeek(clock.get() + 1)}
          disabled={!playable}
        >
          <FastForward />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go to end"
          title="End (End)"
          onClick={() => onSeek(duration)}
          disabled={!playable}
        >
          <SkipForward />
        </Button>
        <TimeReadout clock={clock} duration={duration} />
      </div>
    </main>
  )
})
