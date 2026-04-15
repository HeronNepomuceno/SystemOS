import { Router } from 'express'
import {
  createOS,
  listOS,
  getOSById,
  updateOS,
  deleteOS
} from '../controllers/os.controller'

const router = Router()

router.post('/orders', createOS)
router.get('/orders', listOS)
router.get('/orders/:id', getOSById)
router.patch('/orders/:id', updateOS)
router.delete('/orders/:id', deleteOS)

export { router as osRoutes }