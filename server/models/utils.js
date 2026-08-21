// Keeps serialized documents identical to the previous PostgreSQL responses:
// snake_case columns only, no Mongo internals (_id, __v).
export function jsonTransform(_doc, ret) {
  delete ret._id
  delete ret.__v
  return ret
}

export function toJSONOptions() {
  return { versionKey: false, transform: jsonTransform }
}

// URL params arrive as strings; invalid numbers simply match nothing (404),
// mirroring the old behaviour of looking up a non-existent id.
export function toNumericId(id) {
  const num = Number(id)
  return Number.isInteger(num) ? num : null
}
