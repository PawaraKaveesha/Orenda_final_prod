import * as inquiryModel from '../models/inquiry.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+0-9][0-9()\-\s]{6,39}$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function badRequest(message) {
  const err = new Error(message)
  err.status = 400
  return err
}

// Validates a public contact-form submission. Rejects malformed input with a
// 400 before anything reaches the database.
function validateInquiryInput(body) {
  const { full_name, email, phone, message, check_in, check_out, guests } = body

  const name = String(full_name || '').trim()
  if (!name || name.length > 120) throw badRequest('Full name is required (max 120 characters)')

  const mail = String(email || '').trim()
  if (!mail || mail.length > 255) throw badRequest('A valid email address is required')
  if (!EMAIL_RE.test(mail)) throw badRequest('A valid email address is required')

  if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
    const phoneValue = String(phone).trim()
    if (phoneValue.length > 40 || !PHONE_RE.test(phoneValue)) {
      throw badRequest('A valid phone number is required (7–40 digits, +/()/- allowed)')
    }
  }

  const msg = String(message || '').trim()
  if (!msg) throw badRequest('A message is required')
  if (msg.length > 5000) throw badRequest('Message is too long (max 5000 characters)')

  if (guests !== undefined && guests !== null && guests !== '') {
    const guestsNum = Number(guests)
    if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 32) {
      throw badRequest('Number of guests must be between 1 and 32')
    }
  }

  if (check_in && !ISO_DATE_RE.test(String(check_in))) {
    throw badRequest('Check-in date must be a valid date (YYYY-MM-DD)')
  }
  if (check_out && !ISO_DATE_RE.test(String(check_out))) {
    throw badRequest('Check-out date must be a valid date (YYYY-MM-DD)')
  }
  if (check_in && check_out && String(check_out) < String(check_in)) {
    throw badRequest('Check-out date must not be before the check-in date')
  }
}

export const listInquiries = asyncHandler(async (_req, res) => {
  ok(res, await inquiryModel.findAll())
})

export const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryModel.findById(req.params.id)
  if (!inquiry) throw notFoundError('Inquiry not found')
  ok(res, inquiry)
})

export const createInquiry = asyncHandler(async (req, res) => {
  requireFields(req.body, ['full_name', 'email', 'message'])
  validateInquiryInput(req.body)
  created(res, await inquiryModel.create(req.body))
})

export const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryModel.update(req.params.id, req.body)
  if (!inquiry) throw notFoundError('Inquiry not found')
  ok(res, inquiry)
})

export const addInquiryNote = asyncHandler(async (req, res) => {
  const { note } = req.body
  if (!note || typeof note !== 'string' || !note.trim()) {
    const err = new Error('A non-empty note is required')
    err.status = 400
    throw err
  }
  const inquiry = await inquiryModel.addNote(req.params.id, note.trim())
  if (!inquiry) throw notFoundError('Inquiry not found')
  ok(res, inquiry)
})

export const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryModel.remove(req.params.id)
  if (!inquiry) throw notFoundError('Inquiry not found')
  noContent(res)
})
