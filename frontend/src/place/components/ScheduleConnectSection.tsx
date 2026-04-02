import { useState } from 'react'
import { ChevronDown, ChevronUp, CalendarDays } from 'lucide-react'
import type { MyUpcomingScheduleDTO } from '../types/placeTypes'

interface Props {
  schedules: MyUpcomingScheduleDTO[]
  selectedId: number | null
  onChange: (id: number | null) => void
}

function formatScheduleDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ScheduleConnectSection({ schedules, selectedId, onChange }: Props) {
  const [open, setOpen] = useState(false)

  if (schedules.length === 0) return null

  const selected = schedules.find((s) => s.scheduleId === selectedId)

  return (
    <div className="rounded-xl border border-moa-border bg-moa-light/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-moa-secondary">
          <CalendarDays className="h-4 w-4" />
          {selected ? (
            <span>
              연결된 일정:{' '}
              <span className="text-moa-primary">{selected.title}</span>
            </span>
          ) : (
            '일정과 연결하기 (선택)'
          )}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-moa-subtle" />
        ) : (
          <ChevronDown className="h-4 w-4 text-moa-subtle" />
        )}
      </button>

      {open && (
        <div className="border-t border-moa-border px-4 pb-3 pt-2">
          <p className="mb-2 text-xs text-moa-subtle">
            서클 일정과 연결하면 일정 멤버들이 리뷰를 작성할 수 있습니다.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-white">
              <input
                type="radio"
                name="schedule"
                checked={selectedId === null}
                onChange={() => onChange(null)}
                className="accent-moa-primary"
              />
              <span className="text-sm text-gray-600">연결 안함</span>
            </label>
            {schedules.map((s) => (
              <label
                key={s.scheduleId}
                className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-white"
              >
                <input
                  type="radio"
                  name="schedule"
                  checked={selectedId === s.scheduleId}
                  onChange={() => onChange(s.scheduleId)}
                  className="accent-moa-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{s.title}</p>
                  <p className="text-xs text-moa-subtle">
                    {s.circleName} · {formatScheduleDate(s.startAt)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
