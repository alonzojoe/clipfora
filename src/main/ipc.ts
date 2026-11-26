import { type BrowserWindow, clipboard, dialog, ipcMain, nativeTheme, shell } from 'electron'
import { EXTENSIONS } from './services/media'
import { getTheme, setTheme } from './services/settings'
import { themeState, windowBackground } from './services/theme'
import {
  getWorkspace,
  importFiles,
  removeResource,
  resourcePath,
  setText
} from './services/workspace'

/** Every handler the window can call. Arguments come from the renderer, so each service checks its own input. */
export function registerIpc(getWin: () => BrowserWindow | null): void {
  ipcMain.on('theme:initial', (e) => {
    e.returnValue = themeState() // sync: the preload reads it before the first paint
  })
  ipcMain.handle('theme:get', () => themeState())
  ipcMain.handle('theme:set', (_e, source: unknown) => {
    setTheme(source)
    nativeTheme.themeSource = getTheme()
    return themeState()
  })
  // macOS appearance changed (or themeSource did): keep the window background in step and tell the UI
  nativeTheme.on('updated', () => {
    const w = getWin()
    if (!w || w.isDestroyed()) return
    w.setBackgroundColor(windowBackground())
    w.webContents.send('theme:changed', themeState())
  })

  ipcMain.handle('workspace:get', () => getWorkspace())
  ipcMain.handle('workspace:import', (_e, paths: unknown) => importFiles(paths))
  ipcMain.handle('workspace:pick', async () => {
    const w = getWin()
    if (!w) return getWorkspace()
    const r = await dialog.showOpenDialog(w, {
      title: 'Import resources',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Video, audio and images', extensions: EXTENSIONS }]
    })
    return r.canceled ? getWorkspace() : importFiles(r.filePaths)
  })
  ipcMain.handle('workspace:remove', (_e, id: unknown) => removeResource(id))
  ipcMain.handle('workspace:setInfo', (_e, text: unknown) => setText('info', text))
  ipcMain.handle('workspace:setPrompt', (_e, text: unknown) => setText('prompt', text))
  ipcMain.handle('resource:reveal', (_e, id: unknown) => {
    const path = resourcePath(id)
    if (path) shell.showItemInFolder(path)
  })
  ipcMain.handle('clipboard:write', (_e, text: unknown) => {
    if (typeof text === 'string') clipboard.writeText(text)
  })
}
