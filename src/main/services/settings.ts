import { app } from 'electron'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ThemeSource } from '../../shared/types'

type Settings = { theme?: ThemeSource }

const file = (): string => join(app.getPath('userData'), 'settings.json')

function read(): Settings {
  try {
    return JSON.parse(readFileSync(file(), 'utf8'))
  } catch {
    return {}
  }
}

function write(patch: Settings): void {
  mkdirSync(dirname(file()), { recursive: true })
  writeFileSync(file(), JSON.stringify({ ...read(), ...patch }, null, 2))
}

const THEMES: ThemeSource[] = ['system', 'light', 'dark']

/** Saved appearance (default: follow macOS). */
export const getTheme = (): ThemeSource => {
  const t = read().theme
  return t && THEMES.includes(t) ? t : 'system'
}

export function setTheme(theme: unknown): void {
  if (THEMES.includes(theme as ThemeSource)) write({ theme: theme as ThemeSource })
}
