import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { osRoutes } from './routes/os.routes'
import { tecnicosRoutes } from './routes/tecnicos.routes'
import { swaggerSpec } from './config/swagger'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api', osRoutes)
app.use('/api', tecnicosRoutes)

app.get('/health', (req, res) => {
  return res.json({ status: 'ok' })
})

export { app }
