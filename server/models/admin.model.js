import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const PUBLIC_COLUMNS = `admin_id, full_name, email, role, status,
  must_change_password, password_changed_at, last_login, created_at`

const adminSchema = new mongoose.Schema(
  {
    admin_id: { type: Number, unique: true, index: true },
    full_name: { type: String, required: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
      index: true,
    },
    // Never returned by default; findByEmail opts back in with +password_hash.
    password_hash: { type: String, required: true, select: false, maxlength: 255 },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    must_change_password: { type: Boolean, default: false },
    password_changed_at: { type: Date, default: null },
    last_login: { type: Date, default: null },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema)

export async function findAllPublic() {
  return Admin.find().sort({ admin_id: 1 })
}

export async function findById(id) {
  const adminId = toNumericId(id)
  if (adminId === null) return null
  return Admin.findOne({ admin_id: adminId })
}

export async function findByEmail(email) {
  return Admin.findOne({ email: String(email).toLowerCase().trim() }).select('+password_hash')
}

export async function create({ full_name, email, password_hash, role = 'admin' }) {
  const admin = await Admin.create({
    admin_id: await nextId('admins'),
    full_name,
    email,
    password_hash,
    role,
  })
  return admin
}

export async function updatePassword(id, passwordHash) {
  const adminId = toNumericId(id)
  if (adminId === null) return null
  return Admin.findOneAndUpdate(
    { admin_id: adminId },
    {
      $set: {
        password_hash: passwordHash,
        must_change_password: false,
        password_changed_at: new Date(),
      },
    },
    { new: true },
  )
}

export async function touchLogin(id) {
  const adminId = toNumericId(id)
  if (adminId === null) return
  await Admin.updateOne({ admin_id: adminId }, { $set: { last_login: new Date() } })
}

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) =>
    ['full_name', 'email', 'role', 'status'].includes(key),
  )
  if (fields.length === 0) return null
  const adminId = toNumericId(id)
  if (adminId === null) return null

  const set = {}
  for (const key of fields) set[key] = data[key]
  return Admin.findOneAndUpdate({ admin_id: adminId }, { $set: set }, { new: true })
}

export async function remove(id) {
  const adminId = toNumericId(id)
  if (adminId === null) return null
  const deleted = await Admin.findOneAndDelete({ admin_id: adminId })
  return deleted ? { admin_id: deleted.admin_id } : null
}

export default Admin
