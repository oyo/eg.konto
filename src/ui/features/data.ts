import { cryptoUtils } from '../../shared/datautils/crypto.js'
import { BankingAttributes } from '../../shared/types/banking.js'
import { defaultPaginMeta } from '../../shared/types/data.js'
import store from './store.js'

const decrypt = async (pw: string, st: string, iv: string, cipher: string): Promise<string> => {
  const salt = Uint8Array.from(st, (c) => c.charCodeAt(0))
  const key = await cryptoUtils.deriveSecretKey(pw, salt.buffer)
  return await cryptoUtils.decryptText(key, cipher, iv)
}

export const loadData = async (url: string, userkey: string): Promise<void> => {
  let keys: Record<string, string>
  {
    const response = await fetch('data/keys.json')
    keys = (await response.json()) as Record<string, string>
  }
  let data: string
  {
    const response = await fetch(url)
    data = await response.text()
  }

  if (data && userkey.length > 0) {
    const upw = userkey.substring(0, 11)
    const ust = userkey.substring(11)
    const [uiv, ucipher] = keys[ust].split('.')
    const mkey = await decrypt(upw, ust, uiv, ucipher)
    const [pw, st] = mkey.split('.')
    const [iv, cipher] = data.split('.')
    const plain = await decrypt(pw, st, iv, cipher)
    store.banking = {
      headers: BankingAttributes,
      meta: defaultPaginMeta,
      rows: plain
        .trim()
        .split('\n')
        .reverse()
        .map((r) => r.split('\t').map((w) => (w === '\\N' ? '' : w))),
    }
  } else throw Error('data not loaded')
}
