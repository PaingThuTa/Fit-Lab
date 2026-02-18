export function formatPrice(amount) {
  const numeric = Number(amount || 0)
  return `$${numeric.toFixed(0)}`
}

export function formatShortDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function toDisplayDifficulty(value) {
  if (!value) return 'All Levels'
  const lower = String(value).toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function toApiDifficulty(value) {
  if (!value) return null
  return String(value).trim().toUpperCase()
}
