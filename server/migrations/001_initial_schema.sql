-- ============================================================
-- Orenda Eco lodge and Spa — Migration 001: initial schema
-- Non-destructive (CREATE ... IF NOT EXISTS) so it can run on
-- any fresh or existing database without dropping data.
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  admin_id             SERIAL PRIMARY KEY,
  full_name            VARCHAR(120) NOT NULL,
  email                VARCHAR(255) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  role                 VARCHAR(40)  NOT NULL DEFAULT 'admin'
                         CHECK (role IN ('admin', 'superadmin')),
  status               VARCHAR(20)  NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'disabled')),
  must_change_password BOOLEAN      NOT NULL DEFAULT FALSE,
  password_changed_at  TIMESTAMP,
  last_login           TIMESTAMP,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS villas (
  villa_id         SERIAL PRIMARY KEY,
  villa_name       VARCHAR(120)  NOT NULL UNIQUE,
  tagline          VARCHAR(120),
  location         VARCHAR(120)  NOT NULL DEFAULT 'Resort Grounds',
  size_sqm         SMALLINT      CHECK (size_sqm > 0),
  category         VARCHAR(30)   NOT NULL DEFAULT 'Standard'
                     CHECK (category IN ('Standard', 'Deluxe', 'Family')),
  description      TEXT          NOT NULL,
  price_per_night  NUMERIC(10,2) NOT NULL CHECK (price_per_night > 0),
  max_guests       SMALLINT      NOT NULL CHECK (max_guests BETWEEN 1 AND 16),
  bedrooms         SMALLINT      NOT NULL CHECK (bedrooms >= 1),
  bathrooms        SMALLINT      NOT NULL CHECK (bathrooms >= 1),
  amenities        TEXT[]        NOT NULL DEFAULT '{}',
  image_url        VARCHAR(500)  NOT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'Available'
                     CHECK (status IN ('Available', 'Maintenance', 'Hidden')),
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS villa_images (
  image_id   SERIAL PRIMARY KEY,
  villa_id   INTEGER      NOT NULL REFERENCES villas (villa_id) ON DELETE CASCADE,
  image_url  VARCHAR(500) NOT NULL,
  is_cover   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id SERIAL PRIMARY KEY,
  full_name  VARCHAR(120)  NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  phone      VARCHAR(40),
  villa_id   INTEGER       REFERENCES villas (villa_id) ON DELETE SET NULL,
  check_in   DATE,
  check_out  DATE,
  guests     SMALLINT      NOT NULL DEFAULT 2 CHECK (guests BETWEEN 1 AND 32),
  message    TEXT          NOT NULL,
  status     VARCHAR(20)   NOT NULL DEFAULT 'New'
               CHECK (status IN ('New', 'Read', 'Replied')),
  notes      TEXT[]        NOT NULL DEFAULT '{}',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inquiry_valid_dates
    CHECK (check_in IS NULL OR check_out IS NULL OR check_out >= check_in)
);

CREATE TABLE IF NOT EXISTS offers (
  offer_id            SERIAL PRIMARY KEY,
  title               VARCHAR(120)  NOT NULL,
  tagline             VARCHAR(80),
  savings_label       VARCHAR(80),
  description         TEXT          NOT NULL,
  discount_percentage NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  start_date          DATE          NOT NULL,
  end_date            DATE          NOT NULL,
  banner_image        VARCHAR(500)  NOT NULL,
  duration            VARCHAR(40)   NOT NULL DEFAULT '3 nights',
  base_price          NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
  perks               TEXT[]        NOT NULL DEFAULT '{}',
  is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT offer_valid_range CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS gallery (
  gallery_id  SERIAL PRIMARY KEY,
  image_url   VARCHAR(500) NOT NULL UNIQUE,
  category    VARCHAR(60)  NOT NULL DEFAULT 'Resort',
  uploaded_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  testimonial_id SERIAL PRIMARY KEY,
  customer_name  VARCHAR(120) NOT NULL,
  country        VARCHAR(80)  NOT NULL,
  review         TEXT         NOT NULL,
  rating         SMALLINT     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  booking_id  SERIAL PRIMARY KEY,
  guest_name  VARCHAR(120)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  phone       VARCHAR(40),
  villa_id    INTEGER       NOT NULL REFERENCES villas (villa_id) ON DELETE RESTRICT,
  check_in    DATE          NOT NULL,
  check_out   DATE          NOT NULL,
  guests      SMALLINT      NOT NULL CHECK (guests BETWEEN 1 AND 32),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status      VARCHAR(20)   NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT booking_valid_dates CHECK (check_out >= check_in)
);

CREATE TABLE IF NOT EXISTS messages (
  message_id  SERIAL PRIMARY KEY,
  sender_name VARCHAR(120) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  subject     VARCHAR(160) NOT NULL,
  body        TEXT         NOT NULL,
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  received_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(80)  PRIMARY KEY,
  setting_value TEXT,
  is_public     BOOLEAN      NOT NULL DEFAULT FALSE,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_villas_status ON villas (status);
CREATE INDEX IF NOT EXISTS idx_villa_images_villa ON villa_images (villa_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_villa ON inquiries (villa_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers (is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery (category);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_villa ON bookings (villa_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages (is_read);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);
