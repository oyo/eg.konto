import {
  type DataRow,
  type DataValue,
  defaultPaginMeta,
  type PaginList,
  type PaginTable,
} from '../../shared/types/data.js'

export const listToTable = (paginList: PaginList<DataRow>): PaginTable => {
  const headers = Object.keys(paginList.items[0] || {})
  const rows = paginList.items.map((item) => headers.map((header) => item[header]))
  return {
    headers,
    meta: paginList.meta,
    rows,
  }
}

export const tableToList = (paginTable: PaginTable): PaginList<DataRow> => {
  const items = paginTable.rows.map((row) => {
    const item: Record<string, DataValue> = {}
    paginTable.headers.forEach((header, index) => {
      item[header] = row[index]
    })
    return item
  })
  return {
    items,
    meta: paginTable.meta,
  }
}

export const csvToTable = (csv: string, headers?: string[]): PaginTable => {
  const lines = csv
    .trim()
    .split('\n')
    .filter((line) => line.length > 0)
  if (lines.length === 0) {
    return { headers: [], meta: defaultPaginMeta, rows: [] }
  }
  const rows = (headers ? lines : lines.slice(1)).map((line) =>
    line.split(',').map((cell) => cell.trim()),
  )
  return {
    headers: headers ?? lines[0].split(',').map((h) => h.trim()),
    meta: {
      page: 0,
      pageSize: rows.length,
      total: rows.length,
      totalPages: 1,
    },
    rows,
  }
}

export const tableToCsv = (paginTable: PaginTable): string => {
  const { headers, rows } = paginTable
  const escape = (value: DataValue) => {
    if (value == null) return ''
    const str = String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const headerLine = headers.map(escape).join(',')
  const rowLines = rows.map((row) => row.map(escape).join(','))
  return [headerLine, ...rowLines].join('\n')
}

export const csvToList = (csv: string, headers?: string[]): PaginList<DataRow> => {
  const lines = csv
    .trim()
    .split('\n')
    .filter((line) => line.length > 0)
  if (lines.length === 0) {
    return { items: [], meta: defaultPaginMeta }
  }
  const actualHeaders = headers ?? lines[0].split(',').map((h) => h.trim())
  const dataLines = headers ? lines : lines.slice(1)
  const items = dataLines.map((line) => {
    const cells = line.split(',').map((cell) => cell.trim().replace(/(^"|"$)/g, ''))
    const item: Record<string, DataValue> = {}
    actualHeaders.forEach((header, idx) => {
      item[header] = cells[idx]
    })
    return item
  })
  return {
    items,
    meta: {
      page: 0,
      pageSize: items.length,
      total: items.length,
      totalPages: 1,
    },
  }
}

export const listToCsv = (paginList: PaginList<DataRow>): string => {
  const headers = Object.keys(paginList.items[0] || {})
  const escape = (value: DataValue) => {
    if (value == null) return ''
    const str = String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const headerLine = headers.map(escape).join(',')
  const rowLines = paginList.items.map((item) =>
    headers.map((header) => escape(item[header])).join(','),
  )
  return [headerLine, ...rowLines].join('\n')
}
