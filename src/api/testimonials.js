import api from './client'

export function mapTestimonial(t) {
  return {
    id: t.testimonial_id,
    quote: t.review,
    name: t.customer_name,
    location: t.country,
    rating: t.rating,
  }
}

export const listTestimonials = () =>
  api.get('/testimonials').then((rows) => rows.map(mapTestimonial))
export const createTestimonial = (data) => api.post('/testimonials', data).then(mapTestimonial)
export const updateTestimonial = (id, data) =>
  api.put(`/testimonials/${id}`, data).then(mapTestimonial)
export const deleteTestimonial = (id) => api.delete(`/testimonials/${id}`)
