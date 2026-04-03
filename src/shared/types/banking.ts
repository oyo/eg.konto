export const BankingAttributes = [
  'seq',
  'bdate',
  'name',
  'typeName',
  'description',
  'amount',
  'amountCurrency',
  'balance',
  'balanceCurrency',
]

export interface Banking {
  amount: number
  amountCurrency: string
  balance?: number
  balanceCurrency?: string
  bdate: string
  description: string
  name: string
  seq: number
  typeName: string
}
