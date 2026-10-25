import type { Preset } from '../lib/types'
import { Icon } from './Icon'
import type { IconName } from './icons'

export function PresetButtons({
  presets,
  activeId,
  onPick,
}: {
  presets: Preset[]
  activeId: string | null
  onPick: (id: string) => void
}) {
  return (
    <>
      {presets.map((p) => {
        const r = p.record
        const active = p.id === activeId
        return (
          <button
            key={p.id}
            type="button"
            data-preset={p.id}
            aria-pressed={active}
            onClick={() => onPick(p.id)}
            className={`px-3.5 py-1.5 rounded-lg shadow-sm font-label-md text-label-md flex items-center gap-1.5 ${
              active
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Icon name={(p.icon ?? 'git-compare') as IconName} />
            {`${p.label} (${r.cls}, ${r.engine.toFixed(1)} L, ${r.cyl} cyl, ${r.fuel})`}
          </button>
        )
      })}
    </>
  )
}
