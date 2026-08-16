import api from './client'

export function mapMessage(m) {
  return {
    id: `MSG-${m.message_id}`,
    name: m.sender_name,
    email: m.email,
    subject: m.subject,
    body: m.body,
    receivedAt: m.received_at,
    read: m.is_read,
  }
}

export const listMessages = () => api.get('/messages').then((rows) => rows.map(mapMessage))
export const markMessageRead = (id, read = true) =>
  api.patch(`/messages/${id}/read`, { read }).then(mapMessage)
