import { addEvents, N } from '../../toolkit/index.js'
import { bankingDataLoader } from './bankingDataLoader.js'
import view, { setFilterData } from './bankingFilterTable.js'
import { tableToCsv } from '../../../shared/datautils/convert.js'
import './style.css'

const download = (content: string, filename: string, contentType: string) => {
  if (!contentType) contentType = 'application/octet-stream'
  const a = document.createElement('a')
  const blob = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

const param = new URLSearchParams(location.search)
const userkey = param.get('key')
const url = './data/tb.txt'
let downloadButton
if (userkey) {
  const data = await bankingDataLoader(url, userkey)
  setFilterData(data)
  downloadButton = addEvents(N('button', '\u21D3', { class: 'download' }), {
    click: () => {
      download(tableToCsv(data), 'konto-umsaetze.csv', 'text/csv')
    },
  })
}

export default N('div', [view, downloadButton ?? ''])
