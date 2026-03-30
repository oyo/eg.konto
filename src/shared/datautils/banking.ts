import type { Banking } from '../../shared/types/banking.js'

import { cryptoUtils } from '@shared/datautils/crypto.js'
import fs from 'fs'

const OUTPUT = './public/data/tb.txt'

const typenameMap: Record<string, string> = {
  AB: 'Abschluss',
  DA: 'Dauerauftrag / Terminueberweisung',
  GS: 'Gutschrift',
  GSDA: 'Gutschrift aus Dauerauftrag',
  LS: 'Lastschrift',
  RE: 'Retouren',
  UW: 'Überweisung',
}

const typenameMapRev: Record<string, string> = Object.entries(typenameMap).reduce(
  (a, o) => ({ ...a, [o[1]]: o[0] }),
  {},
)

export const parsePropCsv = (csv: string): Banking[] =>
  csv
    .split('\n')
    .filter((line) => /^(\d\d\.\d\d\.\d\d\d\d;){2}.*;EUR$/.exec(line))
    .reverse()
    .map((line) =>
      ((c) => ({
        amount: parseFloat(c[7].replaceAll('.', '').replace(',', '.')),
        amountCurrency: c[8],
        balance: parseFloat(c[5].replaceAll('.', '').replace(',', '.')),
        balanceCurrency: c[6],
        bdate: c[0].split('.').reverse().join('-'),
        description: c[4],
        name: c[2],
        seq: 0,
        typeName: typenameMapRev[c[3]] ?? 'X',
      }))(line.split(';')),
    )

export const encryptBanking = async (path: string) => {
  const data = fs.readFileSync(path).toString()
  const [pw, st] = (process.env.OXXMAN_PASSWORD ?? '').split('.')
  const salt = Uint8Array.from(st, (c) => c.charCodeAt(0))
  const key = await cryptoUtils.deriveSecretKey(pw, salt.buffer)
  const { cipher, iv } = await cryptoUtils.encryptText(key, data)
  fs.writeFileSync(OUTPUT, `${iv}.${cipher}`)
}
