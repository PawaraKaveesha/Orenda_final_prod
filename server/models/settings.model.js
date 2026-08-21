import mongoose from 'mongoose'
import { toJSONOptions } from './utils.js'

const PUBLIC_KEYS = new Set([
  'resort_name',
  'resort_tagline',
  'resort_description',
  'address',
  'maps_url',
  'phone',
  'phone_secondary',
  'email',
  'email_press',
  'reception_hours',
  'concierge_hours',
  'currency',
  'check_in_time',
  'check_out_time',
  'booking_url',
  'social_instagram',
  'social_facebook',
  'social_tiktok',
])

const settingsSchema = new mongoose.Schema(
  {
    setting_key: { type: String, required: true, unique: true, maxlength: 80 },
    setting_value: { type: String, default: '' },
    is_public: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingsSchema)

export async function findAll({ publicOnly = false } = {}) {
  const filter = publicOnly ? { is_public: true } : {}
  return Setting.find(filter).sort({ setting_key: 1 })
}

export async function findPublicMap() {
  const rows = await findAll({ publicOnly: true })
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value
    return acc
  }, {})
}

export async function upsertMany(entries) {
  const operations = entries.map(({ key, value, isPublic }) => ({
    updateOne: {
      filter: { setting_key: key },
      update: {
        $set: {
          setting_value: value ?? '',
          is_public: isPublic ?? PUBLIC_KEYS.has(key),
          updated_at: new Date(),
        },
      },
      upsert: true,
    },
  }))
  if (operations.length === 0) return
  await Setting.bulkWrite(operations)
}

export default Setting
