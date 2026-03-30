import { BankingData } from '@api/features/data/banking.js'
import { listToTable } from '@shared/datautils/convert.js'
import { type RequestHandler } from 'express'

export const handleBankingItems: RequestHandler = async (req, res) => {
  const pageInfo = {
    page: parseInt(req.query.page as string, 10),
    pageSize: parseInt(req.query.pageSize as string, 10),
  }
  const banking = new BankingData()
  try {
    const list = await banking.loadItemsOrdered(pageInfo)
    const table = listToTable(list)
    res.json(table)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
