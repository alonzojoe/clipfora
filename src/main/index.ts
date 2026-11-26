import { app, BrowserWindow, nativeImage, nativeTheme, shell } from 'electron'
import { join } from 'node:path'
import { is, optimizer } from '@electron-toolkit/utils'
import devIcon from '../../build/icon.png?asset'
import { registerIpc } from './ipc'
import { handleClipProtocol, registerClipScheme } from './services/protocol'
import { getTheme } from './services/settings'
import { windowBackground } from './services/theme'

registerClipScheme()
app.setName('Clipfora')

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: 'Clipfora',
    backgroundColor: windowBackground(),
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })
  win.on('ready-to-show', () => win.show())
  // links open in the browser (https only); the window itself never navigates away from the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (url !== win.webContents.getURL()) e.preventDefault()
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL'])
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  else win.loadFile(join(__dirname, '../renderer/index.html'))
  return win
}

app.whenReady().then(() => {
  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w))
  // apply the saved theme before the window exists, so the first frame is already right
  nativeTheme.themeSource = getTheme()
  handleClipProtocol()
  // `npm run dev` runs inside Electron's own bundle, which would show Electron's icon in the Dock
  if (!app.isPackaged) app.dock?.setIcon(nativeImage.createFromPath(devIcon))
  let win: BrowserWindow | null = createWindow()
  registerIpc(() => win) // once: handlers always talk to the current window
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) win = createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
