import mongoose from 'mongoose'

export async function getStats() {
  const db = mongoose.connection.db
  const [villas, inquiries, newInquiries, activeOffers] = await Promise.all([
    db.collection('villas').countDocuments(),
    db.collection('inquiries').countDocuments(),
    db.collection('inquiries').countDocuments({ status: 'New' }),
    db.collection('offers').countDocuments({ is_active: true }),
  ])

  return {
    totalVillas: villas,
    totalInquiries: inquiries,
    newInquiries,
    activeOffers,
  }
}
