import type { Banking } from '@shared/types/banking.js'

import { BankingData } from '@api/features/data/banking.js'
import { Database } from '@api/features/data/index.js'
import { encryptBankingSlice, parsePropCsv } from '@shared/datautils/banking.js'
import fs from 'fs'

const banking = new BankingData()
try {
  await Database.connect()
  const last = await banking.loadLast()
  console.log(last.seq, last.bdate, last.amount, last.balance)
  if (process.argv.length !== 3) {
    await banking.checkBalance()
  } else {
    try {
      const data = fs.readFileSync(process.argv[2], 'latin1')
      const all = parsePropCsv(data)
      const lasti = all.findIndex(
        (item: Banking) =>
          item.bdate === last.bdate &&
          Math.round(item.amount) === Math.round(last.amount) &&
          Math.round(item.balance ?? 0) === Math.round(last.balance ?? 0),
      )
      const list = all
        .slice(lasti + 1)
        .map((item: Banking, i: number) => ((item.seq = last.seq + i + 1), item))
      console.log(list)
      const n = await banking.addItems(list)
      console.log(`added ${String(n)} rows`)
      if (n > 0) {
        await banking.export()
        await encryptBankingSlice(
          `../data/csv/${new Date().toISOString().substring(2, 10).replace(/-/g, '')}-banking.tsv`,
          [...new Set(list.map((r) => r.bdate.substring(0, 4)))],
        )
      }
    } catch (err) {
      console.error(err)
    }
  }
} catch (error) {
  console.error('Error fetching data:', error)
} finally {
  await Database.disconnect()
}
