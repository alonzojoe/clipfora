import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react'
import { clamp } from '@renderer/lib/format'

/** The playhead time, outside React state: reading it never re-renders; subscribe with useTime(). */
export type Clock = { get: () => number; subscribe: (onChange: () => void) => () => void }

type Player = {
  /** put this on the preview's <video> */
  video: RefObject<HTMLVideoElement | null>
  clock: Clock
  playing: boolean
  duration: number
  seek: (t: number) => void
  toggle: () => void
}

/**
 * Playback for the preview's <video> (it plays audio files too). The element is the source of truth: the clock
 * follows it, so the timeline and the time readout can never drift from what is on screen.
 * `src` is the open resource: when it changes, the player starts again from zero.
 */
export function usePlayer(src: string | null): Player {
  const video = useRef<HTMLVideoElement>(null)
  const now = useRef(0)
  const subs = useRef(new Set<() => void>())
  // playing and duration belong to one source: when `src` changes they read as "stopped, unknown length" until the
  // new file reports in, without an effect having to reset them
  const [state, setState] = useState({ src, playing: false, duration: 0 })
  const { playing, duration } = state.src === src ? state : { playing: false, duration: 0 }

  const clock = useMemo<Clock>(
    () => ({
      get: () => now.current,
      subscribe: (fn) => {
        subs.current.add(fn)
        return () => subs.current.delete(fn)
      }
    }),
    []
  )
  const write = useCallback((t: number): void => {
    if (t === now.current) return
    now.current = t
    for (const fn of subs.current) fn()
  }, [])

  useEffect(() => {
    write(0)
    const v = video.current
    if (!v || !src) return
    const patch = (p: { playing?: boolean; duration?: number }): void =>
      setState((s) => ({ ...(s.src === src ? s : { src, playing: false, duration: 0 }), ...p }))
    const onDuration = (): void => patch({ duration: Number.isFinite(v.duration) ? v.duration : 0 })
    const onPlay = (): void => patch({ playing: true })
    const onPause = (): void => patch({ playing: false })
    const onTime = (): void => write(v.currentTime)
    v.addEventListener('durationchange', onDuration)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('seeking', onTime)
    return () => {
      v.removeEventListener('durationchange', onDuration)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('seeking', onTime)
    }
  }, [src, write])

  // timeupdate fires only about 4 times a second: follow every frame while playing so the playhead moves smoothly
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = (): void => {
      if (video.current) write(video.current.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, write])

  const seek = useCallback(
    (t: number): void => {
      const v = video.current
      if (!v || !Number.isFinite(v.duration)) return
      v.currentTime = clamp(t, 0, v.duration)
      write(v.currentTime)
    },
    [write]
  )

  const toggle = useCallback((): void => {
    const v = video.current
    if (!v) return
    if (!v.paused) return v.pause()
    if (v.ended) v.currentTime = 0 // play again from the start
    v.play().catch((e) => console.warn('playback refused:', e))
  }, [])

  return { video, clock, playing, duration, seek, toggle }
}

/** Subscribe to the playhead. It re-renders the caller on every frame while playing, so keep callers small. */
export const useTime = (clock: Clock): number => useSyncExternalStore(clock.subscribe, clock.get)
