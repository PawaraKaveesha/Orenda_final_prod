import api, { resolveImageUrl } from './client.js'

export function mapRoomPhoto(p) {
  return {
    id: p.room_photo_id,
    src: resolveImageUrl(p.image_url),
    rawSrc: p.image_url,
    caption: p.caption || '',
    uploadedAt: p.uploaded_at,
  }
}

export const listRoomPhotos = () =>
  api.get('/room-photos').then((rows) => rows.map(mapRoomPhoto))

export const uploadRoomPhotos = (files, caption = '') => {
  const formData = new FormData()
  if (caption) formData.append('caption', caption)
  if (Array.isArray(files)) {
    files.forEach((f) => formData.append('images', f))
  } else {
    formData.append('images', files)
  }
  return api.post('/room-photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteRoomPhoto = (id) => api.delete(`/room-photos/${id}`)
