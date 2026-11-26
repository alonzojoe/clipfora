import { useCallback, useEffect, useState } from 'react'
import type { ThemeSource, ThemeState } from '../../../shared/types'

/**
 * The saved appearance (System / Light / Dark). The main process applies and saves it, and the preload tags <html>,
 * so this hook only drives the switch.
 */
export function useTheme(): { theme: ThemeState | null; setTheme: (source: ThemeSource) => void } {
  const [theme, setState] = useState<ThemeState | null>(null)
  useEffect(() => {
    window.api.getTheme().then(setState)
    return window.api.onThemeChanged(setState)
  }, [])
  const setTheme = useCallback((source: ThemeSource) => {
    window.api.setTheme(source).then(setState)
  }, [])
  return { theme, setTheme }
}
