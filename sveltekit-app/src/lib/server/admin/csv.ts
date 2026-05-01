export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return ''
  }

  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]

  for (const row of rows) {
    lines.push(headers.map((header) => formatCsvValue(row[header])).join(','))
  }

  return `${lines.join('\n')}\n`
}

function formatCsvValue(value: unknown) {
  if (value == null) {
    return ''
  }

  const text = value instanceof Date ? value.toISOString() : String(value)

  if (!/[",\n]/.test(text)) {
    return text
  }

  return `"${text.replaceAll('"', '""')}"`
}
