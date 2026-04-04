import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { confirmPayment } from '../api/reservationApi'

type State = 'loading' | 'success' | 'error'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const reservationId = sessionStorage.getItem('pendingReservationId')

    if (!paymentKey || !orderId || !amount || !reservationId) {
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      setState('error')
      return
    }

    confirmPayment({
      reservationId: Number(reservationId),
      paymentKey,
      orderId,
      amount: Number(amount),
    })
      .then(() => {
        sessionStorage.removeItem('pendingReservationId')
        setState('success')
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ?? err?.message ?? '결제 확인 중 오류가 발생했습니다.'
        setErrorMsg(msg)
        setState('error')
      })
  }, [searchParams])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-moa-primary" />
        <p className="text-sm text-moa-subtle">결제를 확인하는 중입니다...</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <XCircle className="h-14 w-14 text-red-400" />
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">결제 확인 실패</h1>
          <p className="mt-2 text-sm text-moa-subtle">{errorMsg}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/place/my-reservations')}
            className="rounded-xl border border-moa-border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            내 예약 확인
          </button>
          <button
            type="button"
            onClick={() => navigate('/place/rental')}
            className="rounded-xl bg-moa-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-moa-hover"
          >
            장소 목록으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <CheckCircle className="h-14 w-14 text-moa-primary" />
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">예약이 완료되었습니다!</h1>
        <p className="mt-2 text-sm text-moa-subtle">결제가 성공적으로 처리되었습니다.</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/place/my-reservations')}
          className="rounded-xl bg-moa-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-moa-hover"
        >
          내 예약 보기
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
