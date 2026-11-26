import { FileAudio, FileVideo, FolderOpen, ImageIcon, Upload, X } from 'lucide-react'
import type * as React from 'react'
import { memo, useState } from 'react'
import type { Resource, Workspace } from '../../../../shared/types'
import { Button } from '@renderer/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Textarea } from '@renderer/components/ui/textarea'
import { fmtSize } from '@renderer/lib/format'
import { cn } from '@renderer/lib/utils'

type Props = {
  workspace: Workspace | null
  selectedId: string | null
  onSelect: (id: string) => void
  onImportPaths: (paths: string[]) => void
  onPick: () => void
  onRemove: (id: string) => void
  onInfo: (text: string) => void
}

function Thumb({ item }: { item: Resource }): React.JSX.Element {
  if (item.kind === 'image' && !item.missing) {
    return (
      <img
        src={item.url}
        alt=""
        draggable={false}
        className="h-9 w-9 shrink-0 rounded-md object-cover"
      />
    )
  }
  const Icon = item.kind === 'video' ? FileVideo : item.kind === 'audio' ? FileAudio : ImageIcon
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-brand-sky">
      <Icon className="h-4 w-4" />
    </span>
  )
}

function Row(props: {
  item: Resource
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}): React.JSX.Element {
  const { item, selected, onSelect, onRemove } = props
  return (
    <li
      className={cn(
        'group flex items-center gap-1 rounded-lg border bg-surface pr-1 hover:border-primary/60',
        selected ? 'border-primary' : 'border-border'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        title={item.path}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 text-left focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Thumb item={item} />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{item.name}</span>
          <span
            className={cn(
              'block truncate text-xs',
              item.missing ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {item.missing ? 'File not found' : `${item.kind} · ${fmtSize(item.size)}`}
          </span>
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Show ${item.name} in Finder`}
        title="Show in Finder"
        disabled={item.missing}
        onClick={() => window.api.reveal(item.id)}
        className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <FolderOpen />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${item.name}`}
        title="Remove from Clipfora (the file is kept)"
        onClick={onRemove}
        className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X />
      </Button>
    </li>
  )
}

/** Left panel: the files to clip from, and the campaign info that goes with them. */
export const ResourceBin = memo(function ResourceBin(props: Props): React.JSX.Element {
  const { workspace, selectedId, onSelect, onImportPaths, onPick, onRemove, onInfo } = props
  const [over, setOver] = useState(false)
  const resources = workspace?.resources ?? []

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setOver(false)
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => window.api.pathForFile(f))
      .filter(Boolean)
    if (paths.length > 0) onImportPaths(paths)
  }

  return (
    <aside aria-label="Resources" className="flex w-[280px] shrink-0 flex-col border-r bg-panel">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a drop target; the Browse button does the same by keyboard */}
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault()
            setOver(true)
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'm-2.5 flex flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-input border-dashed bg-titlebar p-3.5 text-center transition-colors',
          over && 'border-primary bg-primary/10'
        )}
      >
        <Upload className="h-5 w-5 text-primary" />
        <div className="font-semibold">Drop files here</div>
        <div className="text-muted-foreground text-xs leading-snug">
          Video, audio and images. Files stay where they are on your Mac.
        </div>
        <Button variant="outline" size="sm" className="mt-1" onClick={onPick}>
          Browse
        </Button>
      </div>

      <Tabs defaultValue="resources" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-2.5 grid grid-cols-2">
          <TabsTrigger value="resources">
            Resources{resources.length > 0 && ` (${resources.length})`}
          </TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="min-h-0 flex-1 overflow-y-auto p-2.5">
          {resources.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {resources.map((r) => (
                <Row
                  key={r.id}
                  item={r}
                  selected={r.id === selectedId}
                  onSelect={() => onSelect(r.id)}
                  onRemove={() => onRemove(r.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="px-1 text-muted-foreground text-xs leading-snug">
              Nothing imported yet. Drop the long video you want to clip, plus any logo or music the
              campaign gives you.
            </p>
          )}
        </TabsContent>

        <TabsContent value="info" className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
          <label htmlFor="campaign-info" className="font-medium text-xs">
            Campaign info
          </label>
          <Textarea
            id="campaign-info"
            value={workspace?.info ?? ''}
            onChange={(e) => onInfo(e.target.value)}
            placeholder="Paste the campaign rules: required length, captions, tags, links, what to avoid…"
            className="min-h-0 flex-1 resize-none bg-surface"
          />
          <p className="text-muted-foreground text-xs leading-snug">
            Saved as you type and added to the clipping brief.
          </p>
        </TabsContent>
      </Tabs>
    </aside>
  )
})
