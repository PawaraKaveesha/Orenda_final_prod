import api, { resolveImageUrl } from './client'
import { flyerImages } from '../data/images'

const flyerMap = {
  '/images/img-05.jpeg': flyerImages[0],
  '/images/img-06.jpeg': flyerImages[4],
  '/images/img-07.jpeg': flyerImages[2],
  '/images/img-08.jpeg': flyerImages[1],
}

export function mapOffer(o) {
  const resolvedImage = flyerMap[o.banner_image] || resolveImageUrl(o.banner_image)
  return {
    id: String(o.offer_id),
    name: o.title,
    tagline: o.tagline || '',
    duration: o.duration,
    price: Number(o.price),
    savings: o.savings_label || (o.discount_percentage ? `Save ${o.discount_percentage}%` : ''),
    image: resolvedImage,
    rawImage: o.banner_image,
    perks: o.perks || [],
    description: o.description,
    isActive: o.is_active,
    discount: Number(o.discount_percentage),
    basePrice: Number(o.base_price),
    startDate: (o.start_date || '').slice(0, 10),
    endDate: (o.end_date || '').slice(0, 10),
  }
}

export const listActiveOffers = () =>
  api.get('/offers?active=true').then((rows) => rows.map(mapOffer))
export const listOffers = () => api.get('/offers').then((rows) => rows.map(mapOffer))
export const getOffer = (id) => api.get(`/offers/${id}`).then(mapOffer)

export const createOffer = (data) => api.post('/offers', data).then(mapOffer)
export const updateOffer = (id, data) => api.put(`/offers/${id}`, data).then(mapOffer)
export const deleteOffer = (id) => api.delete(`/offers/${id}`)
