export const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) return undefined
  const stringValue = Array.isArray(value) ? value[0] : String(value)
  const normalized = stringValue.toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}
