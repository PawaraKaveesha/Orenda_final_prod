import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import Villa, { VillaImage } from '../models/villa.model.js'
import Offer from '../models/offer.model.js'
import Gallery from '../models/gallery.model.js'
import Testimonial from '../models/testimonial.model.js'
import Setting from '../models/settings.model.js'
import Admin from '../models/admin.model.js'
import { nextId } from '../models/counter.model.js'

const reset = process.argv.includes('--reset')

// A brand-new database is prepared in three safe steps:
//   1. connect to MONGODB_URI (the database is created on first write)
//   2. insert initial content only where collections are empty (idempotent)
//   3. create the initial admin account from ADMIN_EMAIL / ADMIN_PASSWORD
// Nothing here drops, truncates or resets existing data.

function isLocalUri(uri) {
  try {
    const host = new URL(uri.replace('mongodb+srv://', 'https://')).hostname
    return (
      host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]'
    )
  } catch {
    return false
  }
}

async function main() {
  // --- Reset (explicit opt-in, LOCAL databases only) ------------------------
  // Never used for hosted/production databases.
  if (reset) {
    if (!isLocalUri(process.env.MONGODB_URI || '')) {
      throw new Error(
        '--reset is only supported for local MONGODB_URI targets. Never reset a hosted database.',
      )
    }
    await connectDatabase()
    await mongoose.connection.dropDatabase()
    console.log('Dropped the local database (--reset).')
  }

  await connectDatabase()
  console.log(`Connected to ${mongoose.connection.name}.`)

  // --- 1. Seed content (only into empty collections) ------------------------
  await seedVillas()
  await seedOffers()
  await seedGallery()
  await seedTestimonials()
  await seedSettings()

  // --- 2. Initial admin account (env-driven, bcrypt-hashed) ----------------
  await ensureAdmin()

  await disconnectDatabase()
  console.log('Database is ready.')
}

async function isEmpty(model) {
  return (await model.countDocuments()) === 0
}

async function seedVillas() {
  if (!(await isEmpty(Villa))) {
    console.log('Villas already exist — leaving them untouched.')
    return
  }

  const villas = [
    {
      villa_name: 'Araliya Villa',
      tagline: 'Garden Retreat',
      location: 'Garden Wing',
      size_sqm: 125,
      category: 'Standard',
      description:
        'Named after the frangipani that scents its courtyard, Araliya Villa is a tranquil garden retreat wrapped in tropical foliage. Wake to birdsong, bathe beneath the open sky, and let the surrounding palms set the pace of your days.',
      price_per_night: 210,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: [
        'Private garden',
        'Outdoor rain shower',
        'Minibar',
        'Complimentary bikes',
        'Ceiling fan + AC',
        'Daily breakfast',
      ],
      image_url: '/images/img-02.jpeg',
      status: 'Available',
    },
    {
      villa_name: 'Ehela Villa',
      tagline: 'Pool Sanctuary',
      location: 'Courtyard Wing',
      size_sqm: 210,
      category: 'Deluxe',
      description:
        'Ehela Villa pairs warm timber interiors with a private plunge pool shaded by a golden rain tree. An easy, elegant sanctuary for families and friends seeking space, sunlight, and stillness.',
      price_per_night: 320,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: [
        'Private plunge pool',
        'Open-air living pavilion',
        'Full kitchen',
        'Outdoor dining for 6',
        'Smart TV + sound',
        'Daily breakfast',
      ],
      image_url: '/images/img-03.jpeg',
      status: 'Available',
    },
    {
      villa_name: 'Karada Villa',
      tagline: 'Beachfront Escape',
      location: 'Shore Wing',
      size_sqm: 280,
      category: 'Deluxe',
      description:
        'Standing at the edge of the mangroves, Karada Villa is our most coveted address. Step from your verandah onto soft sand, fall asleep to the tide, and watch sunsets spill over the Indian Ocean.',
      price_per_night: 390,
      max_guests: 8,
      bedrooms: 4,
      bathrooms: 4,
      amenities: [
        'Direct beach access',
        'Private verandah + daybeds',
        'Outdoor plunge tub',
        'Butler service',
        'Sunset decks',
        'Daily breakfast + dinner',
      ],
      image_url: '/images/img-04.jpeg',
      status: 'Available',
    },
  ]

  const created = {}
  for (const data of villas) {
    const villa = await Villa.create({ ...data, villa_id: await nextId('villas') })
    created[villa.villa_name] = villa.villa_id
  }
  console.log('Seeded villas.')

  // Cover + extra photos per villa.
  const images = [    ['Araliya Villa', '/images/img-02.jpeg', true],
    ['Araliya Villa', '/images/img-09.jpeg', false],
    ['Araliya Villa', '/images/img-11.jpeg', false],
    ['Ehela Villa', '/images/img-03.jpeg', true],
    ['Ehela Villa', '/images/img-10.jpeg', false],
    ['Ehela Villa', '/images/img-15.jpeg', false],
    ['Karada Villa', '/images/img-04.jpeg', true],
    ['Karada Villa', '/images/img-13.jpeg', false],
    ['Karada Villa', '/images/img-16.jpeg', false],
  ]
  for (const [name, url, cover] of images) {
    await VillaImage.create({
      image_id: await nextId('villa_images'),
      villa_id: created[name],
      image_url: url,
      is_cover: cover,
    })
  }
  console.log('Seeded villa images.')
}

async function seedOffers() {
  if (!(await isEmpty(Offer))) {
    console.log('Offers already exist — leaving them untouched.')
    return
  }

  const offers = [
    {
      title: 'Honeymoon Escape',
      tagline: 'Romance',
      savings_label: 'Save 15%',
      description:
        'Three nights designed for two — candle-lit dinners, sunrise yoga for two, and a private sail along the Galle coast.',
      discount_percentage: 15,
      start_date: '2026-04-01',
      end_date: '2026-11-30',
      banner_image: '/images/img-05.jpeg',
      duration: '3 nights',
      base_price: 812,
      perks: ['Private beachfront dinner', 'Couples spa ritual', 'Sunset boat sail', 'Champagne welcome'],
      is_active: true,
    },
    {
      title: 'Eco Explorer',
      tagline: 'Nature',
      savings_label: 'Save 20%',
      description:
        'Immerse yourself in the wild south — mangroves, tea hills, and rainforest guided by local naturalists, all carbon-offset.',
      discount_percentage: 20,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      banner_image: '/images/img-06.jpeg',
      duration: '4 nights',
      base_price: 1113,
      perks: ['Guided mangrove kayak', 'Tea plantation walk', 'Birding with a naturalist', 'Handmade picnic'],
      is_active: true,
    },
    {
      title: 'Family Haven',
      tagline: 'Family',
      savings_label: 'Kids stay free',
      description:
        'Room to breathe in a three-bedroom villa, with age-friendly extras from sandcastle kits to sunset turtle spotting.',
      discount_percentage: 20,
      start_date: '2026-05-01',
      end_date: '2026-09-30',
      banner_image: '/images/img-07.jpeg',
      duration: '5 nights',
      base_price: 1613,
      perks: ['Kids eat & stay free', 'Family villa upgrade', 'Cooking class', 'Turtle hatchery visit'],
      is_active: true,
    },
    {
      title: 'Slow Living Stay',
      tagline: 'Long stay',
      savings_label: 'Save 25%',
      description:
        'Unplug for a full week. The longer you stay, the deeper the discount — and the slower the clock moves.',
      discount_percentage: 25,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      banner_image: '/images/img-08.jpeg',
      duration: '7 nights',
      base_price: 1987,
      perks: ['Weekly beachfront rate', 'Laundry & airport transfer', 'Weekly housekeeping', 'Flexible check-in'],
      is_active: true,
    },
  ]

  for (const data of offers) {
    await Offer.create({ ...data, offer_id: await nextId('offers') })
  }
  console.log('Seeded offers.')
}

async function seedGallery() {
  if (!(await isEmpty(Gallery))) {
    console.log('Gallery already exists — leaving it untouched.')
    return
  }

  const items = [
    ['/images/img-09.jpeg', 'Beach', '2026-07-28T10:00:00Z'],
    ['/images/img-10.jpeg', 'Villa', '2026-07-24T11:20:00Z'],
    ['/images/img-11.jpeg', 'Interior', '2026-07-20T09:45:00Z'],
    ['/images/img-12.jpeg', 'Nature', '2026-07-15T16:05:00Z'],
    ['/images/img-13.jpeg', 'Beach', '2026-07-10T08:30:00Z'],
    ['/images/img-14.jpeg', 'Wellness', '2026-07-06T14:10:00Z'],
    ['/images/img-15.jpeg', 'Villa', '2026-07-02T12:00:00Z'],
    ['/images/img-16.jpeg', 'Wellness', '2026-06-27T17:40:00Z'],
    ['/images/img-24.jpeg', 'Nature', '2026-06-22T10:15:00Z'],
    ['/images/img-25.jpeg', 'Beach', '2026-06-18T09:00:00Z'],
    ['/images/img-26.jpeg', 'Villa', '2026-06-14T15:30:00Z'],
    ['/images/img-27.jpeg', 'Interior', '2026-06-10T11:55:00Z'],
  ]
  for (const [image_url, category, uploaded_at] of items) {
    await Gallery.create({
      gallery_id: await nextId('gallery'),
      image_url,
      category,
      uploaded_at: new Date(uploaded_at),
    })
  }
  console.log('Seeded gallery.')
}

async function seedTestimonials() {
  if (!(await isEmpty(Testimonial))) {
    console.log('Testimonials already exist — leaving them untouched.')
    return
  }

  const testimonials = [
    {
      customer_name: 'Amelia & James',
      country: 'United Kingdom',
      review:
        'The most restorative week of our lives. Araliya Villa felt like a private sanctuary — the garden showers, the bird song, the food. We left lighter than we arrived.',
      rating: 5,
    },
    {
      customer_name: 'Sofia Ramirez',
      country: 'Spain',
      review:
        'Effortless. The team arranged everything from turtle watching to a private chef on the beach. Karada Villa is pure magic at sunset.',
      rating: 5,
    },
    {
      customer_name: 'Daniel & Priya',
      country: 'Australia',
      review:
        'An eco-lodge that actually means it. Solar-powered, plastic-free, deeply local — and absolutely luxurious. We are already booking our return.',
      rating: 5,
    },
    {
      customer_name: 'Claire Dubois',
      country: 'France',
      review:
        'A week in Ehela with our children was pure joy. The plunge pool, the cooking class, the staff who remembered every name — perfection.',
      rating: 5,
    },
    {
      customer_name: 'Kenji Watanabe',
      country: 'Japan',
      review:
        'The most attentive staff we have ever met. Quiet, thoughtful and endlessly kind. Araliya is a true escape from the world.',
      rating: 5,
    },
    {
      customer_name: 'Noah & Ava',
      country: 'Canada',
      review:
        'Karada at sunset is worth the trip alone. Beautiful rooms, honest sustainability and warm hospitality. We will be back with the whole family.',
      rating: 4,
    },
  ]
  for (const data of testimonials) {
    await Testimonial.create({ ...data, testimonial_id: await nextId('testimonials') })
  }
  console.log('Seeded testimonials.')
}

async function seedSettings() {
  const settings = [
    ['resort_name', 'Orenda Eco lodge and Spa'],
    ['resort_tagline', 'Luxury Eco Resort'],
    ['resort_description', "A small, soulful eco resort on Sri Lanka's southern coast."],
    ['address', 'No 52, Handy Nanayakkara Mawatha, Ankokkawala, Galle 80048, Sri Lanka'],
    ['maps_url', 'https://maps.app.goo.gl/H1mrskAXV2ktWj369'],
    ['phone', '0777700680'],
    ['phone_secondary', '+94 77 123 4567'],
    ['email', 'stay@orendagalle.com'],
    ['email_press', 'press@orendagalle.com'],
    ['reception_hours', 'Daily · 7:00 AM – 10:00 PM'],
    ['concierge_hours', 'Concierge on call 24/7'],
    ['currency', 'LKR'],
    ['check_in_time', '2:00 PM'],
    ['check_out_time', '11:00 AM'],
    ['booking_url', 'https://www.booking.com/Share-B0eRbU'],
    [
      'social_instagram',
      'https://www.instagram.com/orenda_ceylon?igsh=MXNxdjAyam1hZjN1Zg%3D%3D&utm_source=qr',
    ],
    ['social_facebook', 'https://www.facebook.com/share/19DFSLQ9GH/?mibextid=wwXIfr'],
    ['social_tiktok', 'https://www.tiktok.com/@orendaceylon?_r=1&_t=ZS-98nr0EAiVhk'],
  ]

  // Only inserted where the key is missing, so existing admin-edited values
  // are always preserved.
  let inserted = 0
  for (const [key, value] of settings) {
    const exists = await Setting.exists({ setting_key: key })
    if (exists) continue
    await Setting.create({
      setting_key: key,
      setting_value: value,
      is_public: true,
      updated_at: new Date(),
    })
    inserted += 1
  }
  console.log(inserted > 0 ? `Seeded ${inserted} setting(s).` : 'Settings already present.')
}

async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || ''

  if (!email) {
    console.log('ADMIN_EMAIL not set — skipping admin creation. Set it and re-run to create one.')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.warn(`ADMIN_EMAIL "${email}" is not a valid email address — skipping admin creation.`)
    return
  }
  if (password.length < 8) {
    console.warn('ADMIN_PASSWORD must be at least 8 characters — skipping admin creation.')
    return
  }

  const existing = await Admin.findOne({ email })
  if (existing) {
    console.log(`Admin "${email}" already exists — leaving it unchanged (no password reset).`)
    return
  }

  const password_hash = await bcrypt.hash(password, 10)
  await Admin.create({
    admin_id: await nextId('admins'),
    full_name: 'Orenda Administrator',
    email,
    password_hash,
    role: 'superadmin',
    status: 'active',
    must_change_password: true,
  })
  console.log(`Created initial admin account for ${email} (must_change_password = true).`)
}

main().catch(async (err) => {
  console.error('Database setup failed:', err)
  await disconnectDatabase().catch(() => {})
  process.exit(1)
})
