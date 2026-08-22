import api from './client'

export const uploadSingleImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadBatchImages = (files) => {
  const formData = new FormData()
  files.forEach((f) => formData.append('images', f))
  return api.post('/upload/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
