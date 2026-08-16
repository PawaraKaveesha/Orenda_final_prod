import api from './client'

export function mapInquiry(i) {
  return {
    id: `INQ-${i.inquiry_id}`,
    inquiryId: i.inquiry_id,
    name: i.full_name,
    email: i.email,
    phone: i.phone || '',
    villa: i.villa_name || 'General',
    checkIn: i.check_in || '',
    checkOut: i.check_out || '',
    guests: i.guests,
    message: i.message,
    submittedAt: i.created_at,
    status: i.status,
    notes: i.notes || [],
  }
}

export const listInquiries = () => api.get('/inquiries').then((rows) => rows.map(mapInquiry))
export const createInquiry = (data) => api.post('/inquiries', data).then(mapInquiry)
export const updateInquiryStatus = (id, status) =>
  api.patch(`/inquiries/${id}`, { status }).then(mapInquiry)
export const addInquiryNote = (id, note) =>
  api.post(`/inquiries/${id}/notes`, { note }).then(mapInquiry)
export const deleteInquiry = (id) => api.delete(`/inquiries/${id}`)
