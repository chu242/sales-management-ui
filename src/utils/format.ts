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

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

// The local calendar day of a date, as yyyy-mm-dd (the value of an <input type="date">).
export function toDateInputValue(value: string): string {
  const date = parseApiDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Shown in the user's local time zone as yyyy/mm/dd HH:mm:ss, e.g. "2026/10/23 13:07:23".
export function formatDateTime(value: string): string {
  const date = parseApiDate(value)
  if (Number.isNaN(date.getTime())) return value
  const day = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  return `${day} ${time}`
}
