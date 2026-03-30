import { type RequestHandler } from 'express'

export const handleRoot: RequestHandler = (_, res) => {
  res.send('oxxman api is running')
}
