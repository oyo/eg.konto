export interface EncryptionResult {
  cipher: string
  iv: string
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export const cryptoUtils = {
  arrayBufferToBase64(arr: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(arr)))
  },

  base64ToArrayBuffer(base64String: string): ArrayBuffer {
    // @ts-expect-error type conversion
    return Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0))
  },

  async decryptText(key: CryptoKey, ciphertext: string, iv: string): Promise<string> {
    const ciphertextBytes = this.base64ToArrayBuffer(ciphertext)
    const ivBytes = this.base64ToArrayBuffer(iv)

    const decrypted = await crypto.subtle.decrypt(
      {
        iv: ivBytes,
        name: 'AES-GCM',
      },
      key,
      ciphertextBytes,
    )

    return textDecoder.decode(decrypted)
  },

  async deriveSecretKey(masterPassword: string, passwordSalt: ArrayBuffer): Promise<CryptoKey> {
    const masterPasswordRawKey = await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(masterPassword),
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )
    const derivedKey = await crypto.subtle.deriveKey(
      {
        hash: 'SHA-256',
        iterations: 100000,
        name: 'PBKDF2',
        salt: passwordSalt,
      },
      masterPasswordRawKey,
      { length: 256, name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt'],
    )
    return derivedKey
  },

  async digestAsBase64(message: ArrayBuffer | DataView): Promise<string> {
    // @ts-expect-error type conversion
    const digest = await crypto.subtle.digest('SHA-512', message)
    return this.arrayBufferToBase64(digest)
  },

  async encryptText(key: CryptoKey, text: string): Promise<EncryptionResult> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      {
        iv: iv,
        name: 'AES-GCM',
      },
      key,
      textEncoder.encode(text),
    )
    return {
      cipher: arrayBufferToBase64(encrypted),
      // @ts-expect-error type conversion
      iv: this.arrayBufferToBase64(iv),
    }
  },

  async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', key)
  },

  generateSalt(): ArrayBuffer {
    // @ts-expect-error type conversion
    return crypto.getRandomValues(new Uint8Array(16))
  },

  generateSaltAsBase64(): string {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    return btoa(String.fromCharCode(...salt))
  },

  async importKey(rawKey: ArrayBuffer) {
    return await crypto.subtle.importKey('raw', rawKey, { name: 'PBKDF2' }, true, [
      'encrypt',
      'decrypt',
    ])
  },

  random(): string {
    let rnd = ''
    while (rnd.length < 11) rnd = Math.random().toString(36).substring(2)
    return rnd
  },
}
