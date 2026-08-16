-- ============================================================
-- Orenda Eco lodge and Spa — Migration 002: remove unused feature tables
-- The site is now inquiry-based. Booking management and the
-- internal message inbox were removed, so their tables are no
-- longer needed. Idempotent (IF EXISTS) so it is safe on any
-- fresh or existing database.
-- ============================================================

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
