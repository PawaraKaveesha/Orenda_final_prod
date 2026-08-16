import api, { resolveImageUrl } from './client'

// Map the API villa shape to the shape the existing UI components expect.
export function mapVilla(v) {
  return {
    id: String(v.villa_id),
    name: v.villa_name,
    tagline: v.tagline || v.category,
    location: v.location || 'Resort Grounds',
    description: v.description,
    price: Number(v.price_per_night),
    currency: 'LKR',
    unit: 'per night',
    bedrooms: v.bedrooms,
    bathrooms: v.bathrooms,
    guests: v.max_guests,
    size: v.size_sqm,
    image: resolveImageUrl(v.image_url),
    rawImage: v.image_url,
    amenities: v.amenities || [],
    status: v.status,
    enabled: v.status !== 'Hidden',
    lastUpdated: (v.updated_at || '').slice(0, 10),
  }
}

export const listVillas = () => api.get('/villas').then((rows) => rows.map(mapVilla))
export const listAllVillas = () => api.get('/villas/all').then((rows) => rows.map(mapVilla))
export const getVilla = (id) => api.get(`/villas/${id}`).then(mapVilla)

export const createVilla = (data) => api.post('/villas', data).then(mapVilla)
export const updateVilla = (id, data) => api.put(`/villas/${id}`, data).then(mapVilla)
export const deleteVilla = (id) => api.delete(`/villas/${id}`)
