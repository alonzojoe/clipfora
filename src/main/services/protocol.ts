import { protocol } from 'electron'
import { createReadStream, statSync } from 'node:fs'
import { Readable } from 'node:stream'
import { mimeOf } from './media'
import { byteRange } from './range'
import { resourcePath } from './workspace'

/** Must run before app 'ready'. */
export function registerClipScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'clip',
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
    }
  ])
}

const stream = (path: string, span?: { start: number; end: number }): ReadableStream =>
  Readable.toWeb(createReadStream(path, span)) as unknown as ReadableStream

/**
 * clip://media/<id> serves an imported file, read-only, with Range support so video and audio can seek.
 * The id must be one the workspace knows, so the window can never read an arbitrary path.
 */
export function handleClipProtocol(): void {
  protocol.handle('clip', (req) => {
    const url = new URL(req.url)
    const path =
      url.hostname === 'media' ? resourcePath(decodeURIComponent(url.pathname.slice(1))) : null
    if (!path) return new Response('not found', { status: 404 })
    let size: number
    try {
      const st = statSync(path)
      if (!st.isFile()) throw new Error('not a file')
      size = st.size
    } catch {
      return new Response('not found', { status: 404 })
    }
    const headers = {
      'Content-Type': mimeOf(path),
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes'
    }
    const range = byteRange(req.headers.get('range'), size)
    if (range === 'invalid') {
      return new Response(null, {
        status: 416,
        headers: { ...headers, 'Content-Range': `bytes */${size}` }
      })
    }
    if (range) {
      const { start, end } = range
      return new Response(stream(path, range), {
        status: 206,
        headers: {
          ...headers,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': String(end - start + 1)
        }
      })
    }
    return new Response(stream(path), { headers: { ...headers, 'Content-Length': String(size) } })
  })
}
