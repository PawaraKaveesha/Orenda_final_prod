import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { computeApiConfig, resolveImageUrl } from '../src/api/client.js'

describe('computeApiConfig', () => {
  test('Case 1: configured with domain without /api', () => {
    const { apiOrigin, apiBase } = computeApiConfig('https://orenda-api.onrender.com', false)
    assert.equal(apiOrigin, 'https://orenda-api.onrender.com')
    assert.equal(apiBase, 'https://orenda-api.onrender.com/api')
  })

  test('Case 2: configured with domain WITH trailing /api', () => {
    const { apiOrigin, apiBase } = computeApiConfig('https://orenda-api.onrender.com/api', false)
    assert.equal(apiOrigin, 'https://orenda-api.onrender.com')
    assert.equal(apiBase, 'https://orenda-api.onrender.com/api')
  })

  test('Case 3: configured with trailing slashes', () => {
    const { apiOrigin, apiBase } = computeApiConfig('https://orenda-api.onrender.com/api///', false)
    assert.equal(apiOrigin, 'https://orenda-api.onrender.com')
    assert.equal(apiBase, 'https://orenda-api.onrender.com/api')
  })

  test('Case 4: empty in dev (shared origin / Vite proxy)', () => {
    const { apiOrigin, apiBase } = computeApiConfig('', false)
    assert.equal(apiOrigin, '')
    assert.equal(apiBase, '/api')
  })

  test('Case 5: empty in production (falls back to production API domain)', () => {
    const { apiOrigin, apiBase } = computeApiConfig('', true)
    assert.equal(apiOrigin, 'https://orenda-api.onrender.com')
    assert.equal(apiBase, 'https://orenda-api.onrender.com/api')
  })
})

describe('resolveImageUrl', () => {
  const prodOrigin = 'https://orenda-api.onrender.com'

  test('Absolute http/https URLs are returned unchanged', () => {
    const url = 'https://images.unsplash.com/photo-123.jpg'
    assert.equal(resolveImageUrl(url, prodOrigin), url)
  })

  test('Data and Blob URLs are returned unchanged', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS'
    assert.equal(resolveImageUrl(dataUrl, prodOrigin), dataUrl)
  })

  test('Vite-bundled assets (/assets/...) remain relative to frontend host', () => {
    assert.equal(resolveImageUrl('/assets/room-1.jpg', prodOrigin), '/assets/room-1.jpg')
  })

  test('Relative API image URLs (/api/images/...) are prefixed with backend origin in prod', () => {
    assert.equal(
      resolveImageUrl('/api/images/6abf934a8edb2582cb3cd473', prodOrigin),
      'https://orenda-api.onrender.com/api/images/6abf934a8edb2582cb3cd473'
    )
  })

  test('Relative server static images (/images/...) are prefixed with backend origin in prod', () => {
    assert.equal(
      resolveImageUrl('/images/img-02.jpeg', prodOrigin),
      'https://orenda-api.onrender.com/images/img-02.jpeg'
    )
  })

  test('Relative image URLs without leading slash are normalized', () => {
    assert.equal(
      resolveImageUrl('images/img-02.jpeg', prodOrigin),
      'https://orenda-api.onrender.com/images/img-02.jpeg'
    )
  })

  test('Relative URLs in local dev (empty origin) stay relative', () => {
    assert.equal(resolveImageUrl('/api/images/6abf', ''), '/api/images/6abf')
    assert.equal(resolveImageUrl('/images/img-02.jpeg', ''), '/images/img-02.jpeg')
  })

  test('Objects with image properties (src, image_url, rawSrc, url) are supported', () => {
    assert.equal(
      resolveImageUrl({ src: '/api/images/123' }, prodOrigin),
      'https://orenda-api.onrender.com/api/images/123'
    )
    assert.equal(
      resolveImageUrl({ image_url: 'https://example.com/img.jpg' }, prodOrigin),
      'https://example.com/img.jpg'
    )
  })
})
