import api from './client'

export const getPublicSettings = () => api.get('/settings/public')
export const getSettings = () => api.get('/settings')
export const updateSettings = (settings) => api.put('/settings', { settings })
