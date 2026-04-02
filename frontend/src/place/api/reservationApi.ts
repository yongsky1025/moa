import api from '../../api/axiosInstance'
import type { HoldResponse, MyReservationDTO, MyUpcomingScheduleDTO, OccupiedSlotDTO } from '../types/placeTypes'

export const fetchOccupiedSlots = (
  placeId: number,
  date: string,
): Promise<OccupiedSlotDTO[]> =>
  api
    .get<OccupiedSlotDTO[]>(`/api/places/${placeId}/slots`, { params: { date } })
    .then((r) => r.data)

export const holdReservation = (body: {
  placeId: number
  startTime: string
  endTime: string
  scheduleId: number | null
}): Promise<HoldResponse> =>
  api.post<HoldResponse>('/api/reservations/hold', body).then((r) => r.data)

export const confirmPayment = (body: {
  reservationId: number
  paymentKey: string
  orderId: string
  amount: number
}): Promise<void> =>
  api.post('/api/reservations/confirm', body).then(() => undefined)

export const releaseReservation = (reservationId: number): Promise<void> =>
  api.post(`/api/reservations/${reservationId}/release`).then(() => undefined)

export const cancelReservation = (reservationId: number, cancelReason: string): Promise<void> =>
  api
    .post(`/api/reservations/${reservationId}/cancel`, null, { params: { cancelReason } })
    .then(() => undefined)

export const fetchMyReservations = (): Promise<MyReservationDTO[]> =>
  api.get<MyReservationDTO[]>('/api/reservations/my').then((r) => r.data)

export const fetchMyUpcomingSchedules = (): Promise<MyUpcomingScheduleDTO[]> =>
  api.get<MyUpcomingScheduleDTO[]>('/api/schedules/my/created-upcoming').then((r) => r.data)
