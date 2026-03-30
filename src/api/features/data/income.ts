import type { Banking } from '@shared/types/banking.js'
import type { DataRow, PageInfo, PaginList } from '@shared/types/data.js'

import { sanitizePageInfo } from '@api/utils/sanitize.js'

import { Database } from './index.js'

export class BankingData extends Database<Banking> {
  constructor() {
    super('income')
  }

  async loadItemsOrdered(callPageInfo?: PageInfo): Promise<PaginList<DataRow>> {
    const pageInfo = sanitizePageInfo(callPageInfo)
    const res = await Database.pool.query(
      `select * from ${this.table} order by seq desc limit $1::integer offset $2::integer`,
      [pageInfo.pageSize, pageInfo.page * pageInfo.pageSize],
    )
    return {
      items: res.rows as DataRow[],
      meta: await this.getMeta(pageInfo),
    }
  }
}
