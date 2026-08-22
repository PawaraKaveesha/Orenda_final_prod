import api, { resolveImageUrl } from './client'

export function mapGalleryItem(g) {
  return {
    id: g.gallery_id,
    src: resolveImageUrl(g.image_url),
    rawSrc: g.image_url,
    alt: g.category,
    category: g.category,
    uploadedAt: g.uploaded_at,
  }
}

export const listGallery = () => api.get('/gallery').then((rows) => rows.map(mapGalleryItem))

export const addGalleryItem = (imageUrl, category) =>
  api.post('/gallery', { image_url: imageUrl, category })

export const uploadGalleryImages = (files, category = 'Resort') => {
  const formData = new FormData()
  formData.append('category', category)
  if (Array.isArray(files)) {
    files.forEach((f) => formData.append('images', f))
  } else {
    formData.append('images', files)
  }
  return api.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const replaceGalleryImage = (id, file, category) => {
  const formData = new FormData()
  if (category) formData.append('category', category)
  formData.append('images', file)
  return api.put(`/gallery/${id}/replace`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`)
