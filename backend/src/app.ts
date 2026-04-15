import express from 'express'
import cors from 'cors'
import { osRoutes } from './routes/os.routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', osRoutes)

app.get('/health', (req, res) => {
  return res.json({ status: 'ok' })
})

export { app }