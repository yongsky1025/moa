import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle, Loader2 } from 'lucide-react'
import { releaseReservation } from '../api/reservationApi'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [releasing, setReleasing] = useState(true)
  const called = useRef(false)

  const errorCode = searchParams.get('code') ?? ''
  const errorMessage = searchParams.get('message') ?? '결제가 취소되었습니다.'

  useEffect(() => {
    if (called.current) return
    called.current = true

    const reservationId = sessionStorage.getItem('pendingReservationId')
    sessionStorage.removeItem('pendingReservationId')

    if (!reservationId) {
      setReleasing(false)
      return
    }

    releaseReservation(Number(reservationId))
      .catch(() => {})
      .finally(() => setReleasing(false))
  }, [])

  // 이전 장소 상세 페이지로 돌아가기 위해 history 활용
  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-2) // Toss 페이지 한 칸 + 실패 페이지 한 칸
    } else {
      navigate('/place/rental')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <XCircle className="h-14 w-14 text-red-400" />
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">결제에 실패했습니다</h1>
        <p className="mt-2 text-sm text-moa-subtle">{errorMessage}</p>
        {errorCode && (
          <p className="mt-1 text-xs text-gray-400">오류 코드: {errorCode}</p>
        )}
      </div>

      {releasing && (
        <div className="flex items-center gap-2 text-xs text-moa-subtle">
          <Loader2 className="h-4 w-4 animate-spin" />
          예약 선점을 해제하는 중...
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGoBack}
          className="rounded-xl bg-moa-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-moa-hover"
        >
          다시 시도하기
        </button>
        <button
          type="button"
          onClick={() => navigate('/place/rental')}
          className="rounded-xl border border-moa-border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          장소 목록으로
        </button>
      </div>
    </div>
  )
}
