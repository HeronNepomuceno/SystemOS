export const parseStringQuery = (value: unknown): string | undefined => {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : String(value)
}
