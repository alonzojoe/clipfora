import { extname, isAbsolute } from 'node:path'
import type { ResourceKind } from '../../shared/types'

/** File types the preview can play, with the MIME type the clip:// protocol sends. */
const TYPES: Record<string, { kind: ResourceKind; mime: string }> = {
  '.mp4': { kind: 'video', mime: 'video/mp4' },
  '.m4v': { kind: 'video', mime: 'video/mp4' },
  '.mov': { kind: 'video', mime: 'video/quicktime' },
  '.webm': { kind: 'video', mime: 'video/webm' },
  '.mp3': { kind: 'audio', mime: 'audio/mpeg' },
  '.wav': { kind: 'audio', mime: 'audio/wav' },
  '.m4a': { kind: 'audio', mime: 'audio/mp4' },
  '.aac': { kind: 'audio', mime: 'audio/aac' },
  '.png': { kind: 'image', mime: 'image/png' },
  '.jpg': { kind: 'image', mime: 'image/jpeg' },
  '.jpeg': { kind: 'image', mime: 'image/jpeg' },
  '.webp': { kind: 'image', mime: 'image/webp' },
  '.gif': { kind: 'image', mime: 'image/gif' }
}

const typeOf = (file: string): { kind: ResourceKind; mime: string } | undefined =>
  TYPES[extname(file).toLowerCase()]

export const kindOf = (file: string): ResourceKind | null => typeOf(file)?.kind ?? null
export const mimeOf = (file: string): string => typeOf(file)?.mime ?? 'application/octet-stream'

/** Extensions for the open dialog, without the dot. */
export const EXTENSIONS = Object.keys(TYPES).map((e) => e.slice(1))

/** A path the app will import: absolute, a known media type, and not inside a hidden folder. */
export const importable = (file: string): boolean =>
  isAbsolute(file) && kindOf(file) !== null && !file.split(/[\\/]+/).some((p) => p.startsWith('.'))
