import pool from '../config/database.js'

export async function getStats() {
  const [villas, inquiries, newInquiries, activeOffers] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM villas'),
    pool.query('SELECT COUNT(*)::int AS count FROM inquiries'),
    pool.query("SELECT COUNT(*)::int AS count FROM inquiries WHERE status = 'New'"),
    pool.query("SELECT COUNT(*)::int AS count FROM offers WHERE is_active = TRUE"),
  ])

  return {
    totalVillas: villas.rows[0].count,
    totalInquiries: inquiries.rows[0].count,
    newInquiries: newInquiries.rows[0].count,
    activeOffers: activeOffers.rows[0].count,
  }
}
