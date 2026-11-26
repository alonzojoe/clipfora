import { useCallback, useEffect, useState } from 'react'
import type { Workspace } from '../../../shared/types'

type Api = {
  workspace: Workspace | null
  /** import files dropped from Finder */
  importPaths: (paths: string[]) => void
  /** open the file picker */
  pick: () => void
  remove: (id: string) => void
  setInfo: (text: string) => void
  setPrompt: (text: string) => void
}

/** Imported files, campaign info and prompt. The main process owns and saves them; this mirrors them for the UI. */
export function useWorkspace(): Api {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  useEffect(() => {
    window.api.getWorkspace().then(setWorkspace)
  }, [])
  const importPaths = useCallback((paths: string[]) => {
    window.api.importFiles(paths).then(setWorkspace)
  }, [])
  const pick = useCallback(() => {
    window.api.pickFiles().then(setWorkspace)
  }, [])
  const remove = useCallback((id: string) => {
    window.api.removeResource(id).then(setWorkspace)
  }, [])
  // shortcut: saves on every keystroke, debounce it if workspace.json ever grows large
  const setInfo = useCallback((info: string) => {
    setWorkspace((w) => w && { ...w, info })
    window.api.setInfo(info)
  }, [])
  const setPrompt = useCallback((prompt: string) => {
    setWorkspace((w) => w && { ...w, prompt })
    window.api.setPrompt(prompt)
  }, [])
  return { workspace, importPaths, pick, remove, setInfo, setPrompt }
}
