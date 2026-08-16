// Consistent JSON response envelope used by every endpoint.
export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

export function created(res, data) {
  return ok(res, data, 201)
}

export function noContent(res) {
  return res.status(204).end()
}
