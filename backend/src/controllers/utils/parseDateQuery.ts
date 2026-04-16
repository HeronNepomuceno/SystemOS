export const parseDateQuery = (value: unknown): string | null => {
  if (!value) return null
  const dateValue = Array.isArray(value) ? value[0] : value
  if (typeof dateValue !== 'string') return null
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
