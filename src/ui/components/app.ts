import { loadData } from '../features/data.js'
import { N } from '../toolkit/index.js'
import table from './table/index.js'
import chart, { renderData } from './chart/index.js'
import download from './download/index.js'
import store from '../features/store.js'
import { setFilterData } from './table/index.js'

const param = new URLSearchParams(location.search)
const userkey = param.get('key')

if (userkey) {
  await loadData(userkey)
  setFilterData(store.banking)
  renderData(store.banking)
}

export default N('div', [table, chart, download])
