import { type DataValue, type PaginTable } from '../../../shared/types/data.js'
import { addEvents, debounce, N } from '../../toolkit/index.js'

import './style.css'

const RE = {
  seq: /^#\d+/,
  date: /^20[12]\d-/,
  type: /^(RE|UW|GS|AB|LS|GSDA|DA)$/i,
}

interface BankingMetrics {
  aavg: number
  amax: number
  amin: number
  asum: number
  bavg: number
  bmax: number
  bmin: number
  bsum: number
  len: number
}

interface BankingRow {
  seq: number
  amnt: number
  blnc: number
  date: string
  desc: string
  name: string
  type: string
}

const pageArgs = new URLSearchParams(location.search)

const filterColumns = (table: PaginTable) =>
  table.rows.map(
    (row: DataValue[]): BankingRow => ({
      seq: Number(row[0]),
      amnt: Number(row[5]),
      blnc: Number(row[6]),
      date: row[1] as string,
      desc: row[4] as string,
      name: row[2] as string,
      type: row[3] as string,
    }),
  )

const filterRows = (rows: BankingRow[], expr: string) => {
  const re = new RegExp(`(${expr})`, 'i')
  let filt: (row: BankingRow) => boolean
  if (RE.seq.exec(expr)) filt = (row) => Number(expr.substring(1)) === row.seq
  else if (RE.date.exec(expr)) filt = (row) => re.exec(row.date) !== null
  else if (RE.type.exec(expr)) {
    const typere = new RegExp(`^${expr}$`, 'i')
    filt = (row) => typere.exec(row.type) !== null
  } else
    filt = (row) =>
      re.exec(row.date) !== null || re.exec(row.name) !== null || re.exec(row.desc) !== null
  return rows.filter(filt)
}

const calcMetrics = (rows: BankingRow[]): BankingMetrics => {
  const len = rows.length
  const m = rows.reduce(
    (a, c) => ({
      aavg: 0,
      amax: c.amnt > a.amax ? c.amnt : a.amax,
      amin: c.amnt < a.amin ? c.amnt : a.amin,
      asum: a.asum + c.amnt,
      bavg: 0,
      bmax: c.blnc > a.bmax ? c.blnc : a.bmax,
      bmin: c.blnc < a.bmin ? c.blnc : a.bmin,
      bsum: a.bsum + c.blnc,
      len,
    }),
    { aavg: 0, amax: -1e9, amin: 1e9, asum: 0, bavg: 0, bmax: -1e9, bmin: 1e9, bsum: 0, len },
  )
  return {
    ...m,
    aavg: m.asum / len,
    bavg: m.bsum / len,
  }
}

const renderMetrics = (m: BankingMetrics) =>
  N(
    'div',
    [
      N(
        'span',
        `Buchung( # ${m.len.toString()} · ∑ ${formatNumber(m.asum)} · Ø ${formatNumber(m.aavg)} · ⏊ ${formatNumber(m.amin)} · ⏉ ${formatNumber(m.amax)} )`,
      ),
      N(
        'span',
        `Saldo( Ø ${formatNumber(m.bavg)} · ⏊ ${formatNumber(m.bmin)} · ⏉ ${formatNumber(m.bmax)} )`,
      ),
    ],
    { class: 'metrics' },
  )

const formatNumber = (n: number): string =>
  (n < 0 ? '' : '+') +
  n
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const SL = (val: string, label?: string) =>
  addEvents(N('a', label ?? val, { href: '#' }), {
    click: (e: Event) => {
      e.preventDefault()
      filterInput.value = val
      renderFunction()
    },
  })

const render = (rows: BankingRow[]) => {
  while (tbody.lastChild) tbody.removeChild(tbody.lastChild)
  const m = calcMetrics(rows)
  metrics.replaceChildren(renderMetrics(m))
  rows
    .map((row) =>
      N('tr', [
        N('td', SL('#' + String(row.seq), String(row.seq)), { class: 'seq' }),
        N(
          'td',
          ((d) => [
            SL(`${d[0]}-`),
            SL(`${d[0]}-${d[1]}-`, `${d[1]}-`),
            SL(`${d[0]}-${d[1]}-${d[2]}`, d[2]),
          ])(row.date.split('-')),
          { class: 'date' },
        ),
        N('td', SL(row.type), { class: 'type' }),
        N('td', SL(row.name), { class: 'name' }),
        N('td', row.desc, { class: 'desc' }),
        N('td', formatNumber(row.amnt), { class: `amnt${row.amnt < 0 ? ' neg' : ''}` }),
        N('td', formatNumber(row.blnc), { class: `blnc${row.blnc < 0 ? ' neg' : ''}` }),
      ]),
    )
    .forEach((row: HTMLElement | SVGElement) => tbody.appendChild(row))
}

let dataTable: BankingRow[]
const initExpr = pageArgs.get('q') ?? ''
const renderFunction = (skipHistory?: boolean) => {
  const expr = filterInput.value
  render(filterRows(dataTable, expr))
  if (!skipHistory) {
    if (expr.length === 0) pageArgs.delete('q')
    else pageArgs.set('q', expr)
    history.pushState({}, `EGRO - ${expr}`, `${location.pathname}?${pageArgs.toString()}`)
  }
}
const filterInput = addEvents(
  N('input', undefined, {
    autofocus: 'true',
    class: 'filter',
    placeholder: '<filter>',
    value: initExpr,
  }),
  {
    keyup: debounce(() => {
      renderFunction()
    }, 250),
  },
) as HTMLInputElement
const metrics = N('div')
const tbody = N('tbody')
const table = N('table', [tbody], { class: 'banking' })
const view = N('div', [filterInput, metrics, table])

export function setFilterData(data: PaginTable) {
  dataTable = filterColumns(data)
  renderFunction(true)
}

export default view
