import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { osRoutes, tecnicosRoutes } from './routes'
import { swaggerSpec } from './config/swagger'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://systemos-desafio.netlify.app'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
      
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api', osRoutes)
app.use('/api', tecnicosRoutes)

app.get('/health', (req, res) => {
  return res.json({ status: 'ok' })
})

export { app }
