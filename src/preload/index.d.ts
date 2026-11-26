import type { ClipforaApi } from './index'

declare global {
  interface Window {
    api: ClipforaApi
  }
}
