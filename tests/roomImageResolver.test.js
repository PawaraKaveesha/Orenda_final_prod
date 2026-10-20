import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveRoomImages,
  getBundledRoomPhoto,
  bundledRoomMap,
  bundledRoomList,
  verifiedRoomPhotoUrls,
} from '../src/utils/roomImageResolver.js'

describe('getBundledRoomPhoto', () => {
  test('matches Araliya room', () => {
    const photo = getBundledRoomPhoto('Araliya Villa', 0)
    assert.equal(photo, bundledRoomMap.araliya[0])
  })

  test('matches Ehela room', () => {
    const photo = getBundledRoomPhoto('Ehela Villa', 1)
    assert.equal(photo, bundledRoomMap.ehela[0])
  })

  test('matches Karada room', () => {
    const photo = getBundledRoomPhoto('Karada Villa', 2)
    assert.equal(photo, bundledRoomMap.karada[0])
  })

  test('falls back to index modulo for unknown room names', () => {
    const photo = getBundledRoomPhoto('Standard Room', 1)
    assert.equal(photo, bundledRoomList[1])
  })
})

describe('resolveRoomImages Fallback Hierarchy', () => {
  const sampleRoom = { name: 'Araliya Villa', price: 210 }

  test('Tier A: uses roomPhotos API when available', () => {
    const roomPhotos = [
      { room_photo_id: 1, image_url: '/api/images/photo-1', caption: 'Araliya bedroom' },
      { room_photo_id: 2, image_url: '/api/images/photo-2', caption: 'Ehela living' },
    ]
    const result = resolveRoomImages(sampleRoom, 0, roomPhotos, [])
    assert.match(result.primaryImage, /photo-1/)
    assert.equal(result.tier, 'Fallback A (Room Photos API)')
  })

  test('Tier B: uses Gallery Villa/Interior items when roomPhotos is empty', () => {
    const gallery = [
      { gallery_id: 1, image_url: '/images/img-09.jpeg', category: 'Beach' },
      { gallery_id: 2, image_url: '/images/img-10.jpeg', category: 'Villa' },
      { gallery_id: 3, image_url: '/images/img-11.jpeg', category: 'Interior' },
    ]
    const result = resolveRoomImages(sampleRoom, 0, [], gallery)
    assert.match(result.primaryImage, /img-10\.jpeg/)
    assert.equal(result.tier, 'Fallback B (Gallery API)')
  })

  test('Tier C: uses room record image when roomPhotos and gallery are empty', () => {
    const roomWithImage = { ...sampleRoom, image: '/images/img-02.jpeg' }
    const result = resolveRoomImages(roomWithImage, 0, [], [])
    assert.match(result.primaryImage, /img-02\.jpeg/)
    assert.equal(result.tier, 'Fallback C (Room Record)')
  })

  test('Tier D: uses verified references when room image is missing', () => {
    const roomWithoutImage = { name: '', price: 20 }
    const result = resolveRoomImages(roomWithoutImage, 0, [], [])
    assert.match(result.primaryImage, new RegExp(verifiedRoomPhotoUrls[0]))
    assert.equal(result.tier, 'Fallback D (Verified References)')
  })

  test('Always provides fallbackLocalImage for client-side resilience', () => {
    const result = resolveRoomImages(sampleRoom, 0, [], [])
    assert.ok(result.fallbackLocalImage)
    assert.equal(result.fallbackLocalImage, bundledRoomMap.araliya[0])
  })
})
