import api, { resolveImageUrl } from './client'

export function mapGalleryItem(g) {
  return { id: g.gallery_id, src: resolveImageUrl(g.image_url), alt: g.category, category: g.category }
}

export const listGallery = () => api.get('/gallery').then((rows) => rows.map(mapGalleryItem))
export const addGalleryItem = (imageUrl, category) =>
  api.post('/gallery', { image_url: imageUrl, category })
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`)
