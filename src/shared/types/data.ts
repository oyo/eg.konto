export type DataRow = Record<string, DataValue>
export type DataValue = boolean | Date | null | number | string

export interface PageInfo {
  page: number
  pageSize: number
}

export interface PageMeta extends PageInfo {
  total: number
  totalPages: number
}

export const defaultPageInfo: PageInfo = {
  page: 0,
  pageSize: 10,
}

export const defaultPaginMeta: PageMeta = {
  ...defaultPageInfo,
  total: 0,
  totalPages: 0,
}

export interface PaginList<T> {
  items: (DataRow | T)[]
  meta: PageMeta
}

export interface PaginTable {
  headers: string[]
  meta: PageMeta
  rows: DataValue[][]
}

export interface RTKQueryResult {
  data: PaginTable
}
