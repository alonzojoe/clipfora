import { Check, Copy } from 'lucide-react'
import type * as React from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import type { Workspace } from '../../../../shared/types'
import { Button } from '@renderer/components/ui/button'
import { Textarea } from '@renderer/components/ui/textarea'
import { buildBrief } from '@renderer/lib/brief'

const STARTERS = [
  'Find the 5 best moments that stand alone, 20 to 60 seconds each',
  'Crop to 9:16 on the speaker and add word-by-word captions',
  'Open every clip with a strong hook in the first 3 seconds'
]

type Props = { workspace: Workspace | null; onPrompt: (text: string) => void }

/** Right panel: what to clip. The prompt, the campaign info and the files become one brief to copy. */
export const PromptPanel = memo(function PromptPanel({
  workspace,
  onPrompt
}: Props): React.JSX.Element {
  const input = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  const prompt = workspace?.prompt ?? ''
  const files = workspace?.resources.filter((r) => !r.missing).length ?? 0
  const hasInfo = !!workspace?.info.trim()
  const brief = buildBrief(workspace?.info ?? '', workspace?.resources ?? [], prompt)

  return (
    <aside
      aria-label="Clipping prompt"
      className="flex w-[340px] shrink-0 flex-col border-l bg-panel"
    >
      <div className="flex h-[53px] shrink-0 items-center border-subtle border-b px-3.5 font-semibold">
        Clipping prompt
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <p className="text-muted-foreground leading-relaxed">
          Describe the clips you want for the campaign. Clipfora adds your campaign info and source
          files, so the brief below is ready to hand over.
        </p>
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onPrompt(prompt.trim() ? `${prompt.trimEnd()}\n${s}` : s)
              input.current?.focus()
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs hover:border-primary/60 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          >
            {s}
          </button>
        ))}
        <div className="mt-1 flex flex-col gap-1.5">
          <div className="font-medium text-xs">Brief</div>
          <pre className="select-text whitespace-pre-wrap break-words rounded-lg border border-border bg-surface p-3 font-sans text-muted-foreground text-xs leading-relaxed">
            {brief}
          </pre>
        </div>
      </div>

      <div className="border-subtle border-t p-2.5">
        <div className="rounded-xl border border-input bg-surface p-2 focus-within:border-primary">
          <Textarea
            ref={input}
            value={prompt}
            onChange={(e) => onPrompt(e.target.value)}
            rows={4}
            aria-label="Clipping prompt"
            placeholder="What should the clips be? Length, style, captions, hook…"
            className="min-h-0 resize-none border-0 p-1 focus-visible:ring-0"
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="truncate text-muted-foreground text-xs">
              {files} {files === 1 ? 'file' : 'files'} · {hasInfo ? 'info added' : 'no info yet'}
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={() => window.api.copyText(brief).then(() => setCopied(true))}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : 'Copy brief'}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
})
