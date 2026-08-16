import api from './client'

export function mapBooking(b) {
  return {
    id: `BK-${b.booking_id}`,
    bookingId: b.booking_id,
    guestName: b.guest_name,
    email: b.email,
    phone: b.phone || '',
    villa: b.villa_name,
    checkIn: b.check_in,
    checkOut: b.check_out,
    guests: b.guests,
    total: Number(b.total_price),
    status: b.status,
    submittedAt: b.created_at,
  }
}

export const listBookings = () => api.get('/bookings').then((rows) => rows.map(mapBooking))
export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status }).then(mapBooking)
