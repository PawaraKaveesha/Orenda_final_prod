-- ============================================================
-- Orenda Eco lodge and Spa — Luxury Eco Resort
-- Initial seed content (run AFTER schema.sql)
--
-- PRODUCTION-SAFE: every block only inserts when the related table is empty
-- (or, for settings, only missing keys), so re-running this file never
-- duplicates content and never overwrites existing records.
--
-- The admin account is NOT seeded here. It is created by seed/setup.js from
-- the ADMIN_EMAIL / ADMIN_PASSWORD environment variables (password hashed with
-- bcrypt at runtime). No customer inquiries are seeded — those arrive through
-- the live contact form.
-- ============================================================

-- ------------------------------------------------------------
-- Villas
-- ------------------------------------------------------------
INSERT INTO villas
  (villa_name, tagline, location, size_sqm, category, description, price_per_night, max_guests, bedrooms, bathrooms, amenities, image_url, status)
SELECT *
FROM (VALUES
  (
    'Araliya Villa', 'Garden Retreat', 'Garden Wing', 125::SMALLINT, 'Standard',
    'Named after the frangipani that scents its courtyard, Araliya Villa is a tranquil garden retreat wrapped in tropical foliage. Wake to birdsong, bathe beneath the open sky, and let the surrounding palms set the pace of your days.',
    210::NUMERIC, 4::SMALLINT, 2::SMALLINT, 2::SMALLINT,
    ARRAY['Private garden', 'Outdoor rain shower', 'Minibar', 'Complimentary bikes', 'Ceiling fan + AC', 'Daily breakfast'],
    '/images/img-02.jpeg', 'Available'
  ),
  (
    'Ehela Villa', 'Pool Sanctuary', 'Courtyard Wing', 210::SMALLINT, 'Deluxe',
    'Ehela Villa pairs warm timber interiors with a private plunge pool shaded by a golden rain tree. An easy, elegant sanctuary for families and friends seeking space, sunlight, and stillness.',
    320::NUMERIC, 6::SMALLINT, 3::SMALLINT, 3::SMALLINT,
    ARRAY['Private plunge pool', 'Open-air living pavilion', 'Full kitchen', 'Outdoor dining for 6', 'Smart TV + sound', 'Daily breakfast'],
    '/images/img-03.jpeg', 'Available'
  ),
  (
    'Karada Villa', 'Beachfront Escape', 'Shore Wing', 280::SMALLINT, 'Deluxe',
    'Standing at the edge of the mangroves, Karada Villa is our most coveted address. Step from your verandah onto soft sand, fall asleep to the tide, and watch sunsets spill over the Indian Ocean.',
    390::NUMERIC, 8::SMALLINT, 4::SMALLINT, 4::SMALLINT,
    ARRAY['Direct beach access', 'Private verandah + daybeds', 'Outdoor plunge tub', 'Butler service', 'Sunset decks', 'Daily breakfast + dinner'],
    '/images/img-04.jpeg', 'Available'
  )
) AS v(villa_name, tagline, location, size_sqm, category, description, price_per_night, max_guests, bedrooms, bathrooms, amenities, image_url, status)
WHERE NOT EXISTS (SELECT 1 FROM villas);

-- ------------------------------------------------------------
-- Villa images (cover + extras)
-- ------------------------------------------------------------
INSERT INTO villa_images (villa_id, image_url, is_cover)
SELECT villa_id, url, cover
FROM (
  SELECT villa_id, '/images/img-02.jpeg' AS url, TRUE AS cover FROM villas WHERE villa_name = 'Araliya Villa'
  UNION ALL
  SELECT villa_id, '/images/img-09.jpeg', FALSE FROM villas WHERE villa_name = 'Araliya Villa'
  UNION ALL
  SELECT villa_id, '/images/img-11.jpeg', FALSE FROM villas WHERE villa_name = 'Araliya Villa'
  UNION ALL
  SELECT villa_id, '/images/img-03.jpeg', TRUE FROM villas WHERE villa_name = 'Ehela Villa'
  UNION ALL
  SELECT villa_id, '/images/img-10.jpeg', FALSE FROM villas WHERE villa_name = 'Ehela Villa'
  UNION ALL
  SELECT villa_id, '/images/img-15.jpeg', FALSE FROM villas WHERE villa_name = 'Ehela Villa'
  UNION ALL
  SELECT villa_id, '/images/img-04.jpeg', TRUE FROM villas WHERE villa_name = 'Karada Villa'
  UNION ALL
  SELECT villa_id, '/images/img-13.jpeg', FALSE FROM villas WHERE villa_name = 'Karada Villa'
  UNION ALL
  SELECT villa_id, '/images/img-16.jpeg', FALSE FROM villas WHERE villa_name = 'Karada Villa'
) AS images(villa_id, url, cover)
WHERE NOT EXISTS (SELECT 1 FROM villa_images);

-- ------------------------------------------------------------
-- Offers
-- ------------------------------------------------------------
INSERT INTO offers
  (title, tagline, savings_label, description, discount_percentage, start_date, end_date, banner_image, duration, base_price, perks, is_active)
SELECT *
FROM (VALUES
  (
    'Honeymoon Escape', 'Romance', 'Save 15%',
    'Three nights designed for two — candle-lit dinners, sunrise yoga for two, and a private sail along the Galle coast.',
    15::NUMERIC, '2026-04-01'::DATE, '2026-11-30'::DATE, '/images/img-05.jpeg', '3 nights', 812::NUMERIC,
    ARRAY['Private beachfront dinner', 'Couples spa ritual', 'Sunset boat sail', 'Champagne welcome'],
    TRUE
  ),
  (
    'Eco Explorer', 'Nature', 'Save 20%',
    'Immerse yourself in the wild south — mangroves, tea hills, and rainforest guided by local naturalists, all carbon-offset.',
    20::NUMERIC, '2026-01-01'::DATE, '2026-12-31'::DATE, '/images/img-06.jpeg', '4 nights', 1113::NUMERIC,
    ARRAY['Guided mangrove kayak', 'Tea plantation walk', 'Birding with a naturalist', 'Handmade picnic'],
    TRUE
  ),
  (
    'Family Haven', 'Family', 'Kids stay free',
    'Room to breathe in a three-bedroom villa, with age-friendly extras from sandcastle kits to sunset turtle spotting.',
    20::NUMERIC, '2026-05-01'::DATE, '2026-09-30'::DATE, '/images/img-07.jpeg', '5 nights', 1613::NUMERIC,
    ARRAY['Kids eat & stay free', 'Family villa upgrade', 'Cooking class', 'Turtle hatchery visit'],
    TRUE
  ),
  (
    'Slow Living Stay', 'Long stay', 'Save 25%',
    'Unplug for a full week. The longer you stay, the deeper the discount — and the slower the clock moves.',
    25::NUMERIC, '2026-01-01'::DATE, '2026-12-31'::DATE, '/images/img-08.jpeg', '7 nights', 1987::NUMERIC,
    ARRAY['Weekly beachfront rate', 'Laundry & airport transfer', 'Weekly housekeeping', 'Flexible check-in'],
    TRUE
  )
) AS o(title, tagline, savings_label, description, discount_percentage, start_date, end_date, banner_image, duration, base_price, perks, is_active)
WHERE NOT EXISTS (SELECT 1 FROM offers);

-- ------------------------------------------------------------
-- Gallery
-- ------------------------------------------------------------
INSERT INTO gallery (image_url, category, uploaded_at)
SELECT *
FROM (VALUES
  ('/images/img-09.jpeg', 'Beach',    '2026-07-28 10:00:00'::TIMESTAMP),
  ('/images/img-10.jpeg', 'Villa',    '2026-07-24 11:20:00'),
  ('/images/img-11.jpeg', 'Interior', '2026-07-20 09:45:00'),
  ('/images/img-12.jpeg', 'Nature',   '2026-07-15 16:05:00'),
  ('/images/img-13.jpeg', 'Beach',    '2026-07-10 08:30:00'),
  ('/images/img-14.jpeg', 'Wellness', '2026-07-06 14:10:00'),
  ('/images/img-15.jpeg', 'Villa',    '2026-07-02 12:00:00'),
  ('/images/img-16.jpeg', 'Wellness', '2026-06-27 17:40:00'),
  ('/images/img-24.jpeg', 'Nature',   '2026-06-22 10:15:00'),
  ('/images/img-25.jpeg', 'Beach',    '2026-06-18 09:00:00'),
  ('/images/img-26.jpeg', 'Villa',    '2026-06-14 15:30:00'),
  ('/images/img-27.jpeg', 'Interior', '2026-06-10 11:55:00')
) AS g(image_url, category, uploaded_at)
WHERE NOT EXISTS (SELECT 1 FROM gallery);

-- ------------------------------------------------------------
-- Testimonials
-- ------------------------------------------------------------
INSERT INTO testimonials (customer_name, country, review, rating)
SELECT *
FROM (VALUES
  (
    'Amelia & James', 'United Kingdom',
    'The most restorative week of our lives. Araliya Villa felt like a private sanctuary — the garden showers, the bird song, the food. We left lighter than we arrived.',
    5::SMALLINT
  ),
  (
    'Sofia Ramirez', 'Spain',
    'Effortless. The team arranged everything from turtle watching to a private chef on the beach. Karada Villa is pure magic at sunset.',
    5::SMALLINT
  ),
  (
    'Daniel & Priya', 'Australia',
    'An eco-lodge that actually means it. Solar-powered, plastic-free, deeply local — and absolutely luxurious. We are already booking our return.',
    5::SMALLINT
  ),
  (
    'Claire Dubois', 'France',
    'A week in Ehela with our children was pure joy. The plunge pool, the cooking class, the staff who remembered every name — perfection.',
    5::SMALLINT
  ),
  (
    'Kenji Watanabe', 'Japan',
    'The most attentive staff we have ever met. Quiet, thoughtful and endlessly kind. Araliya is a true escape from the world.',
    5::SMALLINT
  ),
  (
    'Noah & Ava', 'Canada',
    'Karada at sunset is worth the trip alone. Beautiful rooms, honest sustainability and warm hospitality. We will be back with the whole family.',
    4::SMALLINT
  )
) AS t(customer_name, country, review, rating)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);

-- ------------------------------------------------------------
-- Settings — only inserted where the key is missing, so existing
-- admin-edited values are always preserved.
-- ------------------------------------------------------------
INSERT INTO settings (setting_key, setting_value, is_public)
SELECT s.key, s.value, s.public
FROM (VALUES
  ('resort_name',          'Orenda Eco lodge and Spa',                   TRUE),
  ('resort_tagline',       'Luxury Eco Resort',                          TRUE),
  ('resort_description',   'A small, soulful eco resort on Sri Lanka''s southern coast.', TRUE),
  ('address',              'No 52, Handy Nanayakkara Mawatha, Ankokkawala, Galle 80048, Sri Lanka', TRUE),
  ('maps_url',             'https://maps.app.goo.gl/H1mrskAXV2ktWj369',  TRUE),
  ('phone',                '0777700680',                                 TRUE),
  ('phone_secondary',      '+94 77 123 4567',                            TRUE),
  ('email',                'stay@orendagalle.com',                       TRUE),
  ('email_press',          'press@orendagalle.com',                      TRUE),
  ('reception_hours',      'Daily · 7:00 AM – 10:00 PM',                 TRUE),
  ('concierge_hours',      'Concierge on call 24/7',                     TRUE),
  ('currency',             'LKR',                                        TRUE),
  ('check_in_time',        '2:00 PM',                                    TRUE),
  ('check_out_time',       '11:00 AM',                                   TRUE),
  ('booking_url',          'https://www.booking.com/Share-B0eRbU',       TRUE),
  ('social_instagram',     'https://www.instagram.com/orenda_ceylon?igsh=MXNxdjAyam1hZjN1Zg%3D%3D&utm_source=qr', TRUE),
  ('social_facebook',      'https://www.facebook.com/share/19DFSLQ9GH/?mibextid=wwXIfr', TRUE),
  ('social_tiktok',        'https://www.tiktok.com/@orendaceylon?_r=1&_t=ZS-98nr0EAiVhk', TRUE)
) AS s(key, value, public)
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = s.key);
