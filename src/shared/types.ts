/** App appearance: follow macOS, or force light or dark. Saved in the app's settings.json. */
export type ThemeSource = 'system' | 'light' | 'dark'
export type ThemeState = { source: ThemeSource; dark: boolean }

export type ResourceKind = 'video' | 'audio' | 'image'

/** A file the user imported. It stays where it is on disk; the app only remembers its path. */
export type Resource = {
  id: string
  path: string
  name: string
  kind: ResourceKind
  /** bytes, 0 when the file is missing */
  size: number
  /** clip://media/<id>, the only way the window reads the file */
  url: string
  /** the file was moved or deleted after it was imported */
  missing: boolean
}

/** Everything the editor shows: imported files, the campaign info and the clipping prompt. */
export type Workspace = { resources: Resource[]; info: string; prompt: string }
