import { addEvents, N } from '../../toolkit/index.js'
import { tableToCsv } from '../../../shared/datautils/convert.js'
import './style.css'
import store from '../../features/store.js'

const download = (content: string, filename: string, contentType: string) => {
  if (!contentType) contentType = 'application/octet-stream'
  const a = document.createElement('a')
  const blob = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

const view = addEvents(N('button', '\u21D3', { class: 'download', title: 'download CSV' }), {
  click: () => {
    if (store.banking.rows.length > 0)
      download(tableToCsv(store.banking), 'konto-umsaetze.csv', 'text/csv')
  },
})

export default view
