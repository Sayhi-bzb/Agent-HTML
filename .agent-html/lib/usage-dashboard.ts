export type UsageDashboardRow = {
  accountCost: number
  bucketStart: string
  cost: number
  durationSeconds: number
  hour: string
  requests: number
  tokens: number
  users: number
}

type UsageCsvRecord = {
  account_cost: string
  active_users: string
  bucket_start: string
  cache_creation_tokens: string
  cache_read_tokens: string
  input_tokens: string
  output_tokens: string
  total_cost: string
  total_duration_ms: string
  total_requests: string
}

const hourFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  hour: "2-digit",
  month: "short",
})

export function parseUsageDashboardCsv(csv: string): UsageDashboardRow[] {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/)
  const headers = headerLine.split(",")

  return lines
    .filter(Boolean)
    .map((line) => parseRecord(headers, line))
    .map((record) => {
      const bucketStart = normalizeDateOffset(record.bucket_start)
      return {
        accountCost: toNumber(record.account_cost),
        bucketStart,
        cost: toNumber(record.total_cost),
        durationSeconds: Math.round(toNumber(record.total_duration_ms) / 1000),
        hour: hourFormatter.format(new Date(bucketStart)),
        requests: toNumber(record.total_requests),
        tokens:
          toNumber(record.input_tokens) +
          toNumber(record.output_tokens) +
          toNumber(record.cache_creation_tokens) +
          toNumber(record.cache_read_tokens),
        users: toNumber(record.active_users),
      }
    })
    .sort((a, b) => Date.parse(a.bucketStart) - Date.parse(b.bucketStart))
}

export function latestUsageRows(
  rows: readonly UsageDashboardRow[],
  count: number
) {
  return rows.slice(Math.max(rows.length - count, 0))
}

function parseRecord(headers: string[], line: string) {
  const values = line.split(",")
  return headers.reduce<Record<string, string>>((record, header, index) => {
    record[header] = values[index] ?? ""
    return record
  }, {}) as UsageCsvRecord
}

function normalizeDateOffset(value: string) {
  return value
    .replace(" ", "T")
    .replace(/([+-]\d{2})$/, "$1:00")
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
