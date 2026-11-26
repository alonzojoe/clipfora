import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import type { Resource, Workspace } from '../../shared/types'
import { importable, kindOf } from './media'

/** What is saved: only the path of each imported file. Size and "missing" are read fresh every time. */
type Stored = { resources: { id: string; path: string }[]; info: string; prompt: string }

const MAX_TEXT = 100_000

const file = (): string => join(app.getPath('userData'), 'workspace.json')

function read(): Stored {
  try {
    const s = JSON.parse(readFileSync(file(), 'utf8')) as Partial<Stored>
    return {
      resources: Array.isArray(s.resources)
        ? s.resources.filter((r) => typeof r?.id === 'string' && typeof r?.path === 'string')
        : [],
      info: typeof s.info === 'string' ? s.info : '',
      prompt: typeof s.prompt === 'string' ? s.prompt : ''
    }
  } catch {
    return { resources: [], info: '', prompt: '' }
  }
}

function write(s: Stored): void {
  mkdirSync(dirname(file()), { recursive: true })
  writeFileSync(file(), JSON.stringify(s, null, 2))
}

const isFile = (path: string): boolean => {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

function toResource({ id, path }: { id: string; path: string }): Resource | null {
  const kind = kindOf(path)
  if (!kind) return null
  const missing = !isFile(path)
  return {
    id,
    path,
    name: basename(path),
    kind,
    size: missing ? 0 : statSync(path).size,
    url: `clip://media/${id}`,
    missing
  }
}

export function getWorkspace(): Workspace {
  const s = read()
  return {
    resources: s.resources.map(toResource).filter((r) => r !== null),
    info: s.info,
    prompt: s.prompt
  }
}

/** Remember files the user dropped or picked. Nothing is copied, and a file already imported is skipped. */
export function importFiles(paths: unknown): Workspace {
  const s = read()
  const known = new Set(s.resources.map((r) => r.path))
  const list = Array.isArray(paths) ? paths : []
  for (const p of list) {
    if (typeof p !== 'string' || known.has(p) || !importable(p) || !isFile(p)) continue
    known.add(p)
    s.resources.push({ id: randomUUID(), path: p })
  }
  write(s)
  return getWorkspace()
}

/** Forget an imported file. The file itself is never deleted. */
export function removeResource(id: unknown): Workspace {
  const s = read()
  write({ ...s, resources: s.resources.filter((r) => r.id !== id) })
  return getWorkspace()
}

export function setText(key: 'info' | 'prompt', text: unknown): void {
  if (typeof text === 'string') write({ ...read(), [key]: text.slice(0, MAX_TEXT) })
}

/** The path behind clip://media/<id>: only files the user imported can be read by the window. */
export function resourcePath(id: unknown): string | null {
  return read().resources.find((r) => r.id === id)?.path ?? null
}
