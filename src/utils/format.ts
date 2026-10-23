// Money arrives from the backend as decimal strings ("1.50"). To add amounts up without
// floating-point errors (0.1 + 0.2 !== 0.3), convert them to whole cents first.

// "1.5" -> 150, "300000.00" -> 30000000. Returns NaN for anything that is not a money amount.
export function toCents(amount: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(amount.trim())
  if (!match) return Number.NaN
  return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'))
}

// 1234567 -> "12,345.67"
export function formatCents(cents: number): string {
  const whole = Math.floor(cents / 100)
  const fraction = String(cents % 100).padStart(2, '0')
  return `${whole.toLocaleString()}.${fraction}`
}

// "300000.00" -> "300,000.00"
export function formatMoney(amount: string): string {
  const cents = toCents(amount)
  return Number.isNaN(cents) ? amount : formatCents(cents)
}

// The backend stores sale_date in UTC but sends it without a timezone ("2026-10-23T06:37:23").
// new Date() would read that as local time, so mark it as UTC before parsing.
export function parseApiDate(value: string): Date {
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(value)
  return new Date(hasTimezone ? value : `${value}Z`)
}

// Shown in the user's local time zone, e.g. "Oct 23, 2026, 1:07 PM".
export function formatDateTime(value: string): string {
  return parseApiDate(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
