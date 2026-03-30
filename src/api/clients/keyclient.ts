import { cryptoUtils } from '@shared/datautils/crypto.js'
import fs from 'fs'

if (process.argv.length !== 3) {
  console.log('usage: ts-node src/client/keyclient.ts (add | <key>)')
  process.exit()
}

const KEYFILE = './public/data/keys.json'
const keys: Record<string, string> = JSON.parse(fs.readFileSync(KEYFILE).toString()) as Record<
  string,
  string
>
const akey = process.argv[2]
const dkey = akey.substring(akey.length - 11)

if (akey !== 'add' && keys[dkey]) {
  // eslint-disable-next-line
  delete keys[dkey]
  fs.writeFileSync(KEYFILE, JSON.stringify(keys, null, 2))
  process.exit()
}

const data = process.env.OXXMAN_PASSWORD ?? ''
const pw = cryptoUtils.random()
const st = cryptoUtils.random()
const salt = Uint8Array.from(st, (c: string) => c.charCodeAt(0))
const key = await cryptoUtils.deriveSecretKey(pw, salt.buffer)
const enc = await cryptoUtils.encryptText(key, data)
keys[st] = `${enc.iv}.${enc.cipher}`
fs.writeFileSync(KEYFILE, JSON.stringify(keys, null, 2))
console.log(`${pw}${st}`)
