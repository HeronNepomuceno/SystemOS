import { Router } from 'express'
import { createOS } from '../controllers/os.controller'

const router = Router()

router.post('/orders', createOS)

export { router as osRoutes }