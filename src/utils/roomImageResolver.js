const araliya1 = new URL('../assets/images/Rooms/araliya-1.jpeg', import.meta.url).href
const araliya2 = new URL('../assets/images/Rooms/araliya-2.jpeg', import.meta.url).href
const ehela1 = new URL('../assets/images/Rooms/ehela-1.jpeg', import.meta.url).href
const ehela2 = new URL('../assets/images/Rooms/ehela-2.jpeg', import.meta.url).href
const karada1 = new URL('../assets/images/Rooms/karada-1.jpeg', import.meta.url).href
import { resolveImageUrl } from '../api/client.js'

export const bundledRoomMap = {
  araliya: [araliya1, araliya2],
  ehela: [ehela1, ehela2],
  karada: [karada1],
}

export const bundledRoomList = [araliya1, ehela1, karada1]

// Verified references to known room photo records
export const verifiedRoomPhotoUrls = [
  '/api/images/6abf934a8edb2582cb3cd473',
  '/api/images/6abf934a8edb2582cb3cd478',
  '/api/images/6abf934a8edb2582cb3cd47d',
]

/**
 * Returns a bundled local room photo for a given room name or index.
 */
export function getBundledRoomPhoto(roomName = '', index = 0) {
  const norm = String(roomName).toLowerCase().trim()
  for (const [key, imgs] of Object.entries(bundledRoomMap)) {
    if (norm.includes(key)) {
      return imgs[0]
    }
  }
  return bundledRoomList[index % bundledRoomList.length] || null
}

/**
 * Normalizes any image item/string to a resolved URL string.
 */
function extractAndResolve(item) {
  if (!item) return ''
  const raw = typeof item === 'string' ? item : item.src || item.image_url || item.rawSrc || item.url || ''
  return resolveImageUrl(raw)
}

/**
 * Resolves the primary image and image list for a room using the 6-tier fallback hierarchy:
 *  - Fallback A: Existing room-photo API records
 *  - Fallback B: Existing Gallery API pipeline (filtered to Villa/Interior categories)
 *  - Fallback C: Existing Room/Villa record image fields
 *  - Fallback D: Known verified room photo URLs
 *  - Fallback E: Bundled local room images
 *  - Fallback F: Honest failure state (empty string, handled cleanly by RoomCard)
 *
 * @param {Object} room - The room data object
 * @param {number} index - Index of the room in the list
 * @param {Array} [roomPhotos] - Photos from listRoomPhotos API
 * @param {Array} [gallery] - Items from listGallery API
 * @returns {{ primaryImage: string, allImages: string[], fallbackLocalImage: string, tier: string }}
 */
export function resolveRoomImages(room, index = 0, roomPhotos = [], gallery = []) {
  const roomName = room?.name || room?.villa_name || ''
  const bundledLocal = getBundledRoomPhoto(roomName, index)

  // ---------------------------------------------------------------------------
  // Fallback A: Existing room-photo API (listRoomPhotos)
  // ---------------------------------------------------------------------------
  if (Array.isArray(roomPhotos) && roomPhotos.length > 0) {
    const validPhotos = roomPhotos
      .map(extractAndResolve)
      .filter((url) => typeof url === 'string' && url.length > 0)

    if (validPhotos.length > 0) {
      // Check if any photo caption or filename matches this room name
      const matched = roomPhotos.filter((p) => {
        const text = `${p?.caption || ''} ${p?.rawSrc || ''} ${p?.src || ''}`.toLowerCase()
        const norm = roomName.toLowerCase().split(' ')[0]
        return norm && text.includes(norm)
      })

      const assigned = matched.length > 0
        ? extractAndResolve(matched[0])
        : validPhotos[index % validPhotos.length]

      if (assigned) {
        return {
          primaryImage: assigned,
          allImages: [assigned],
          fallbackLocalImage: bundledLocal,
          tier: 'Fallback A (Room Photos API)',
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Fallback B: Existing Gallery image pipeline (listGallery)
  // Filter only relevant Villa / Interior categories to avoid promotional flyers
  // ---------------------------------------------------------------------------
  if (Array.isArray(gallery) && gallery.length > 0) {
    const villaGalleryItems = gallery
      .filter((item) => {
        const cat = String(item?.category || item?.alt || '').toLowerCase()
        return cat.includes('villa') || cat.includes('interior') || cat.includes('room')
      })
      .map(extractAndResolve)
      .filter((url) => typeof url === 'string' && url.length > 0)

    if (villaGalleryItems.length > 0) {
      const assigned = villaGalleryItems[index % villaGalleryItems.length]
      if (assigned) {
        return {
          primaryImage: assigned,
          allImages: [assigned],
          fallbackLocalImage: bundledLocal,
          tier: 'Fallback B (Gallery API)',
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Fallback C: Existing room records (villas from listVillas)
  // Inspect room.image, room.images, room.image_url, room.rawImage
  // ---------------------------------------------------------------------------
  const roomRecordRaw =
    room?.image ||
    room?.rawImage ||
    room?.image_url ||
    (Array.isArray(room?.images) && room.images.length > 0 ? room.images[0] : '')

  const roomRecordImg = extractAndResolve(roomRecordRaw)
  if (roomRecordImg && !roomRecordImg.endsWith('/null') && !roomRecordImg.endsWith('/undefined')) {
    return {
      primaryImage: roomRecordImg,
      allImages: [roomRecordImg],
      fallbackLocalImage: bundledLocal,
      tier: 'Fallback C (Room Record)',
    }
  }

  // ---------------------------------------------------------------------------
  // Fallback D: Known verified existing image references
  // ---------------------------------------------------------------------------
  if (verifiedRoomPhotoUrls.length > 0) {
    const verifiedUrl = extractAndResolve(verifiedRoomPhotoUrls[index % verifiedRoomPhotoUrls.length])
    if (verifiedUrl) {
      return {
        primaryImage: verifiedUrl,
        allImages: [verifiedUrl],
        fallbackLocalImage: bundledLocal,
        tier: 'Fallback D (Verified References)',
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Fallback E: Bundled local room images
  // ---------------------------------------------------------------------------
  if (bundledLocal) {
    return {
      primaryImage: bundledLocal,
      allImages: [bundledLocal],
      fallbackLocalImage: bundledLocal,
      tier: 'Fallback E (Bundled Local Photos)',
    }
  }

  // ---------------------------------------------------------------------------
  // Fallback F: Honest failure state
  // ---------------------------------------------------------------------------
  return {
    primaryImage: '',
    allImages: [],
    fallbackLocalImage: '',
    tier: 'Fallback F (Honest Failure State)',
  }
}
