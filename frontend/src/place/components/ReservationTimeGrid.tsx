import type { OccupiedSlotDTO } from '../types/placeTypes'

interface Props {
  openTime: string   // "HH:mm:ss"
  closeTime: string  // "HH:mm:ss"
  minMinutes: number
  maxMinutes: number
  occupiedSlots: OccupiedSlotDTO[]
  startTime: string | null  // "HH:mm"
  endTime: string | null    // "HH:mm"
  onSlotClick: (slot: string) => void
  /** 오늘 날짜 여부. true이면 현재 시각 이전 슬롯을 선택 불가 처리 */
  isToday?: boolean
  /** 현재 시각 "HH:mm" — isToday=true 일 때만 사용 */
  nowTime?: string
}

function timeToMin(t: string): number {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function minToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function generateSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = []
  let cur = timeToMin(openTime)
  const close = timeToMin(closeTime)
  while (cur <= close) {
    slots.push(minToTime(cur))
    cur += 30
  }
  return slots
}

function isOccupied(slot: string, occupiedSlots: OccupiedSlotDTO[]): boolean {
  const slotMin = timeToMin(slot)
  return occupiedSlots.some((os) => {
    const s = timeToMin(os.startTime)
    const e = timeToMin(os.endTime)
    return slotMin >= s && slotMin < e
  })
}

function hasOccupiedBetween(
  startMin: number,
  endMin: number,
  occupiedSlots: OccupiedSlotDTO[],
): boolean {
  return occupiedSlots.some((os) => {
    const s = timeToMin(os.startTime)
    const e = timeToMin(os.endTime)
    return s < endMin && e > startMin
  })
}

type SlotState =
  | 'occupied'
  | 'selected-start'
  | 'selected-end'
  | 'selected-range'
  | 'valid-end'
  | 'invalid-end'
  | 'available'

function getSlotState(
  slot: string,
  startTime: string | null,
  endTime: string | null,
  occupiedSlots: OccupiedSlotDTO[],
  minMinutes: number,
  maxMinutes: number,
  closeTime: string,
  isToday?: boolean,
  nowTime?: string,
): SlotState {
  // 오늘 날짜인 경우 현재 시각 이전 슬롯은 예약 불가
  if (isToday && nowTime) {
    const slotMin = timeToMin(slot)
    const nowMin = timeToMin(nowTime)
    if (slotMin <= nowMin) return 'occupied'
  }
  if (isOccupied(slot, occupiedSlots)) return 'occupied'
  if (slot === startTime) return 'selected-start'
  if (slot === endTime) return 'selected-end'

  const slotMin = timeToMin(slot)
  const closeMin = timeToMin(closeTime)

  if (startTime && !endTime) {
    const startMin = timeToMin(startTime)
    const diff = slotMin - startMin
    if (slotMin <= startMin) return 'available'
    if (diff < minMinutes) return 'invalid-end'
    if (diff > maxMinutes) return 'invalid-end'
    if (hasOccupiedBetween(startMin, slotMin, occupiedSlots)) return 'invalid-end'
    if (slotMin > closeMin) return 'invalid-end'
    return 'valid-end'
  }

  if (startTime && endTime) {
    const startMin = timeToMin(startTime)
    const endMin = timeToMin(endTime)
    if (slotMin > startMin && slotMin < endMin) return 'selected-range'
  }

  return 'available'
}

const STATE_CLASS: Record<SlotState, string> = {
  occupied:
    'bg-gray-100 text-gray-300 line-through cursor-not-allowed border border-gray-200',
  'selected-start':
    'bg-moa-primary text-white font-bold border border-moa-primary cursor-pointer',
  'selected-end':
    'bg-moa-primary text-white font-bold border border-moa-primary cursor-pointer',
  'selected-range':
    'bg-moa-light text-moa-secondary font-semibold border border-moa-muted cursor-pointer',
  'valid-end':
    'bg-green-50 text-green-700 border border-green-300 cursor-pointer hover:bg-green-100',
  'invalid-end':
    'bg-gray-50 text-gray-300 border border-gray-200 cursor-not-allowed',
  available:
    'bg-white text-gray-700 border border-gray-200 cursor-pointer hover:border-moa-primary hover:text-moa-primary',
}

export default function ReservationTimeGrid({
  openTime,
  closeTime,
  minMinutes,
  maxMinutes,
  occupiedSlots,
  startTime,
  endTime,
  onSlotClick,
  isToday,
  nowTime,
}: Props) {
  const slots = generateSlots(openTime, closeTime)

  const canClick = (state: SlotState): boolean =>
    state !== 'occupied' && state !== 'invalid-end'

  return (
    <div>
      <p className="mb-2 text-xs text-moa-subtle">
        {startTime
          ? endTime
            ? '다시 선택하려면 아무 슬롯이나 클릭하세요'
            : '종료 시간을 선택하세요 (초록색 슬롯)'
          : '시작 시간을 선택하세요'}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((slot) => {
          const state = getSlotState(
            slot,
            startTime,
            endTime,
            occupiedSlots,
            minMinutes,
            maxMinutes,
            closeTime,
            isToday,
            nowTime,
          )
          const clickable = canClick(state)
          return (
            <button
              key={slot}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSlotClick(slot)}
              className={`rounded-lg py-2 text-center text-xs font-medium transition-all ${STATE_CLASS[state]}`}
            >
              {slot}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-moa-subtle">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-moa-primary bg-moa-primary" />
          선택됨
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-gray-200 bg-gray-100" />
          예약불가
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-green-300 bg-green-50" />
          선택가능 종료
        </span>
      </div>
    </div>
  )
}
