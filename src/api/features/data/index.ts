import { defaultPageInfo, type PageInfo } from '@shared/types/data.js'
import pMemoize from 'p-memoize'
import { Pool } from 'pg'

export class Database<T> {
  protected static pool = new Pool()

  static {
    Database.pool = new Pool({
      database: process.env.DB_DATABASE ?? 'oxxman',
      host: process.env.DB_HOST ?? 'localhost',
      password: process.env.DB_PASSWORD ?? '',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER ?? 'postgres',
    })
    //console.log('Database pool created')
  }

  getItemsDefault = pMemoize(this.loadItemsDefault.bind(this))
  getTotal = pMemoize(this.loadTotal.bind(this))

  protected table: string

  protected total = 0

  constructor(table: string) {
    this.table = table
  }

  static async connect() {
    await this.pool.connect()
    //console.log('Database pool connected')
  }

  static async disconnect() {
    try {
      await this.pool.end()
      console.log('Database pool disconnected')
    } catch (e) {
      console.log('Database pool has been disconnected', e)
    }
  }

  async getMeta(pageInfo: PageInfo) {
    const total = await this.getTotal()
    return {
      ...pageInfo,
      total,
      totalPages: Math.ceil(total / pageInfo.pageSize),
    }
  }

  async loadItemsDefault() {
    const pageInfo = defaultPageInfo
    const res = await Database.pool.query(
      `select * from ${this.table} order by seq desc limit $1::integer offset $2::integer`,
      [pageInfo.pageSize, pageInfo.page * pageInfo.pageSize],
    )
    return {
      items: res.rows as T[],
      meta: await this.getMeta(pageInfo),
    }
  }

  async loadTotal() {
    const count = await Database.pool.query(`select count(*) as count from ${this.table}`)
    const result = count.rows[0] as { count: string }
    return Number(result.count)
  }
}
