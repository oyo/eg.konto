import { defaultPaginMeta, type PaginTable } from '../../shared/types/data'

export type StoreType = {
  banking: PaginTable
}

const store: StoreType = {
  banking: {
    headers: [],
    meta: defaultPaginMeta,
    rows: [],
  },
}

export default store
