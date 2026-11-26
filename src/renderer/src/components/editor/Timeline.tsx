import { Minus, Plus } from 'lucide-react'
import type * as React from 'react'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Resource } from '../../../../shared/types'
import { Button } from '@renderer/components/ui/button'
import { Slider } from '@renderer/components/ui/slider'
import { type Clock, useTime } from '@renderer/hooks/usePlayer'
import { clamp } from '@renderer/lib/format'

const HEADER = 120
const RULER = 24
const PAD = 24
const MAX_ZOOM = 40
/** seconds between ruler ticks: the first one that leaves at least 64px between labels is used */
const STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600]

type Props = {
  /** the open video or audio file, or null */
  resource: Resource | null
  /** the playhead: only <Playhead> subscribes, so the ruler does not re-render while playing */
  clock: Clock
  duration: number
  onSeek: (t: number) => void
}

const label = (s: number, long: boolean): string =>
  long ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : `${s}s`

/** The playhead line. It reports where it is, so the timeline can keep it in view while playing and after jumps. */
function Playhead(props: {
  clock: Clock
  pps: number
  onMove: (x: number) => void
}): React.JSX.Element {
  const { clock, pps, onMove } = props
  const time = useTime(clock)
  const x = HEADER + time * pps
  useEffect(() => onMove(x), [x, onMove])
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-30 w-0.5 bg-primary"
      style={{ left: x - 1 }}
      aria-hidden="true"
    >
      <span className="-left-[6px] absolute top-0 h-3 w-3.5 rounded-t-sm rounded-b-md bg-primary" />
    </div>
  )
}

/** Bottom panel: the open file on a time ruler. Click or drag the ruler to scrub. At zoom 1 the whole file fits. */
export const Timeline = memo(function Timeline({
  resource,
  clock,
  duration,
  onSeek
}: Props): React.JSX.Element {
  const [zoom, setZoom] = useState(1)
  const [viewW, setViewW] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const keepInView = useCallback((x: number): void => {
    const el = scroller.current
    if (!el) return
    if (x > el.scrollLeft + el.clientWidth - 80 || x < el.scrollLeft + HEADER)
      el.scrollLeft = Math.max(0, x - HEADER - 40)
  }, [])

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setViewW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const lane = Math.max(1, viewW - HEADER)
  const pps = duration > 0 ? (Math.max(1, lane - PAD) / duration) * zoom : 0
  const width = Math.max(lane, duration * pps + PAD)

  const ticks = useMemo(() => {
    if (pps <= 0) return []
    const step = STEPS.find((s) => s * pps >= 64) ?? STEPS[STEPS.length - 1]
    const out: number[] = []
    for (let s = 0; s <= duration + 0.001; s += step) out.push(Math.round(s * 100) / 100)
    return out
  }, [pps, duration])

  const timeAt = (clientX: number): number => {
    const el = scroller.current
    if (!el || pps <= 0) return 0
    const x = clientX - el.getBoundingClientRect().left + el.scrollLeft - HEADER
    return clamp(x / pps, 0, duration)
  }

  const scrub = (e: React.PointerEvent): void => {
    if (e.button !== 0 || duration <= 0) return
    onSeek(timeAt(e.clientX))
    const move = (ev: PointerEvent): void => onSeek(timeAt(ev.clientX))
    const up = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <section aria-label="Timeline" className="flex h-[150px] shrink-0 flex-col border-t bg-panel">
      <div className="flex h-10 shrink-0 items-center gap-2 border-subtle border-b px-3">
        <span className="font-semibold text-xs">Timeline</span>
        <div className="flex-1" />
        <span className="text-muted-foreground text-xs">Zoom</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom out"
          disabled={duration <= 0}
          onClick={() => setZoom((z) => clamp(z / 1.5, 1, MAX_ZOOM))}
        >
          <Minus />
        </Button>
        <Slider
          aria-label="Zoom"
          className="w-28"
          min={1}
          max={MAX_ZOOM}
          step={0.5}
          value={[zoom]}
          disabled={duration <= 0}
          onValueChange={([v]) => setZoom(v)}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom in"
          disabled={duration <= 0}
          onClick={() => setZoom((z) => clamp(z * 1.5, 1, MAX_ZOOM))}
        >
          <Plus />
        </Button>
      </div>

      <div ref={scroller} className="relative min-h-0 flex-1 overflow-auto">
        <div className="relative h-full" style={{ width: width + HEADER }}>
          <div
            className="sticky top-0 z-20 flex border-subtle border-b bg-panel"
            style={{ height: RULER }}
          >
            <div
              className="sticky left-0 z-10 shrink-0 border-subtle border-r bg-panel"
              style={{ width: HEADER }}
            />
            <div className="relative cursor-col-resize" style={{ width }} onPointerDown={scrub}>
              {ticks.map((s) => (
                <span
                  key={s}
                  className="absolute top-0 h-full border-border border-l pl-1 font-mono text-[11px] text-muted-foreground leading-6"
                  style={{ left: s * pps }}
                >
                  {label(s, duration >= 60)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex h-11 border-subtle border-b">
            <div
              className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-subtle border-r bg-panel px-3 font-medium"
              style={{ width: HEADER }}
            >
              <span className="h-2 w-2 rounded-sm bg-brand-blue" />
              Source
            </div>
            <div className="relative" style={{ width }} onPointerDown={scrub}>
              {resource && duration > 0 ? (
                <div
                  title={resource.name}
                  className="absolute top-1 flex h-9 items-center overflow-hidden whitespace-nowrap rounded-md border border-brand-blue/40 bg-track-source px-2 font-medium text-xs"
                  style={{ left: 0, width: Math.max(3, duration * pps) }}
                >
                  <span className="truncate">{resource.name}</span>
                </div>
              ) : (
                <span className="absolute inset-0 flex items-center px-3 text-muted-foreground text-xs">
                  Open a video or audio file to see it here
                </span>
              )}
            </div>
          </div>

          {duration > 0 && <Playhead clock={clock} pps={pps} onMove={keepInView} />}
        </div>
      </div>
    </section>
  )
})
