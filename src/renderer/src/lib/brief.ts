import type { Resource } from '../../../shared/types'

/**
 * The clipping brief: the campaign info, the imported files and what the user asked for, as one prompt.
 * Missing files are left out, and so is any part the user left empty.
 */
export function buildBrief(info: string, resources: Resource[], prompt: string): string {
  const files = resources.filter((r) => !r.missing).map((r) => `- ${r.path}`)
  return [
    'Make vertical 9:16 clips (1080 x 1920).',
    info.trim() && `Campaign info:\n${info.trim()}`,
    files.length > 0 && `Source files:\n${files.join('\n')}`,
    prompt.trim() && `What to make:\n${prompt.trim()}`
  ]
    .filter(Boolean)
    .join('\n\n')
}
