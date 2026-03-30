import type { Banking } from '@shared/types/banking.js'
import type { DataRow, PageInfo, PaginList } from '@shared/types/data.js'

import { sanitizePageInfo } from '@api/utils/sanitize.js'

import { Database } from './index.js'

export class BankingData extends Database<Banking> {
  constructor() {
    super('banking')
  }

  async addItems(items: Banking[]): Promise<number> {
    if (items.length === 0) return 0
    try {
      await Database.pool.query('BEGIN')
      for (const item of items) {
        await Database.pool.query(
          `insert into ${this.table}(seq,bdate,name,typename,description,amount,amount_currency,balance,balance_currency) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            item.seq,
            item.bdate,
            item.name,
            item.typeName,
            item.description,
            item.amount,
            item.amountCurrency,
            item.balance,
            item.balanceCurrency,
          ],
        )
      }
      const check = await this.checkBalance()
      if (!check) throw Error('check failed')
      await Database.pool.query('COMMIT')
      return items.length
    } catch (e) {
      await Database.pool.query('ROLLBACK')
      throw e
    }
  }

  async checkBalance() {
    const count = await Database.pool.query(
      `select a.rows as rows, b.maxrow as maxrow, a.val as sum, b.val as expect from (
    select count(*) as rows, sum(amount) as val from ${this.table}
  ) a
  inner join (
    select seq as maxrow, balance as val from ${this.table} inner join (select max(seq) as m from ${this.table}) on seq=m
  ) b on 1=1;
  `,
    )
    const checkData = count.rows[0] as { expect: number; maxrow: number; rows: number; sum: number }
    const diffR = checkData.maxrow - checkData.rows
    const diffB = checkData.sum - checkData.expect
    console.log('Check balance:')
    console.log(`maxrow = ${String(checkData.maxrow)}, rows = ${String(checkData.rows)}`)
    console.log(`expect = ${String(checkData.expect)}, sum = ${String(checkData.sum)}`)
    console.log(`diff = ${String(diffR)}, ${String(diffB)}`)
    return diffR === 0 && diffB === 0
  }

  async export() {
    await Database.pool.query(
      `copy (select * from ${this.table}) to '/opt/data/csv/${new Date().toISOString().substring(2, 10).replace(/-/g, '')}-banking.tsv'`,
    )
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

  async loadLast() {
    const res = await Database.pool.query(
      `select * from ${this.table} where seq=(select MAX(seq) from ${this.table})`,
    )
    return res.rows[0] as Banking
  }
}
