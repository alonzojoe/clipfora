import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { ThemeSource, ThemeState, Workspace } from '../shared/types'

// Theme before first paint: ask main for the saved theme synchronously, then tag <html> the moment the parser
// creates it (the preload runs before it exists). CSS reads html.dark / html.light, so nothing flashes.
const applyTheme = (dark: boolean): void => {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
}
const initialTheme = ipcRenderer.sendSync('theme:initial') as ThemeState
if (document.documentElement) applyTheme(initialTheme.dark)
else
  new MutationObserver((_, obs) => {
    if (!document.documentElement) return
    applyTheme(initialTheme.dark)
    obs.disconnect()
  }).observe(document, { childList: true })
ipcRenderer.on('theme:changed', (_e, t: ThemeState) => applyTheme(t.dark))

const api = {
  getTheme: (): Promise<ThemeState> => ipcRenderer.invoke('theme:get'),
  setTheme: (source: ThemeSource): Promise<ThemeState> => ipcRenderer.invoke('theme:set', source),
  onThemeChanged: (cb: (t: ThemeState) => void): (() => void) => {
    const fn = (_: unknown, t: ThemeState): void => cb(t)
    ipcRenderer.on('theme:changed', fn)
    return () => ipcRenderer.removeListener('theme:changed', fn)
  },
  getWorkspace: (): Promise<Workspace> => ipcRenderer.invoke('workspace:get'),
  /** remember files by path (nothing is copied) */
  importFiles: (paths: string[]): Promise<Workspace> =>
    ipcRenderer.invoke('workspace:import', paths),
  /** open the macOS file picker, then import what was chosen */
  pickFiles: (): Promise<Workspace> => ipcRenderer.invoke('workspace:pick'),
  removeResource: (id: string): Promise<Workspace> => ipcRenderer.invoke('workspace:remove', id),
  setInfo: (text: string): Promise<void> => ipcRenderer.invoke('workspace:setInfo', text),
  setPrompt: (text: string): Promise<void> => ipcRenderer.invoke('workspace:setPrompt', text),
  /** show an imported file in Finder */
  reveal: (id: string): Promise<void> => ipcRenderer.invoke('resource:reveal', id),
  copyText: (text: string): Promise<void> => ipcRenderer.invoke('clipboard:write', text),
  /** absolute path of a file dropped from Finder */
  pathForFile: (file: File): string => webUtils.getPathForFile(file)
}

export type ClipforaApi = typeof api

contextBridge.exposeInMainWorld('api', api)
