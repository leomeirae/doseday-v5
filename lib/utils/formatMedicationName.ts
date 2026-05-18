export function formatMedicationName(full: string): string {
  const parenIndex = full.indexOf(' (')
  return parenIndex === -1 ? full : full.slice(0, parenIndex)
}
