export function formatLKR(price) {
  const amount = Math.round(Number(price) || 0)
  return `Rs. ${amount.toLocaleString('en-US')}`
}
