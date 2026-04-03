import { cryptoUtils } from '../../shared/datautils/crypto.js'
import { BankingAttributes } from '../../shared/types/banking.js'
import { defaultPaginMeta } from '../../shared/types/data.js'
import store from './store.js'

const decrypt = async (pw: string, st: string, iv: string, cipher: string): Promise<string> => {
  const salt = Uint8Array.from(st, (c) => c.charCodeAt(0))
  const key = await cryptoUtils.deriveSecretKey(pw, salt.buffer)
  return await cryptoUtils.decryptText(key, cipher, iv)
}

const loadYear = async (year: number, mkey: string): Promise<string> => {
  const response = await fetch(`./data/ta/${year}.txt`)
  const data = await response.text()

  const [pw, st] = mkey.split('.')
  const [iv, cipher] = data.split('.')
  return await decrypt(pw, st, iv, cipher)
}

export const loadData = async (userkey: string): Promise<void> => {
  let keys: Record<string, string>
  {
    const response = await fetch('data/keys.json')
    keys = (await response.json()) as Record<string, string>
  }
  if (userkey.length !== 22) return
  const upw = userkey.substring(0, 11)
  const ust = userkey.substring(11)
  const [uiv, ucipher] = keys[ust].split('.')
  const mkey = await decrypt(upw, ust, uiv, ucipher)
  const currentYear = new Date().getFullYear()
  const years = Array(currentYear - 2015)
    .fill(0)
    .map((_, i) => i + 2016)
  const data = (await Promise.all(years.map(async (y) => loadYear(y, mkey)))).join('\n')

  store.banking = {
    headers: BankingAttributes,
    meta: defaultPaginMeta,
    rows: data
      .trim()
      .split('\n')
      .reverse()
      .map((r) => r.split('\t').map((w) => (w === '\\N' ? '' : w))),
  }
}
