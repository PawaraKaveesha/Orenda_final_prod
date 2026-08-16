export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export function notFoundError(message = 'Resource not found') {
  const err = new Error(message)
  err.status = 404
  return err
}
