import { Router } from 'express'
import {
  createTecnico,
  listTecnicos,
  getTecnicoById,
  updateTecnico,
  deleteTecnico
} from '../controllers/tecnicos.controller'

const router = Router()

router.post('/tecnicos', createTecnico)
router.get('/tecnicos', listTecnicos)
router.get('/tecnicos/:id', getTecnicoById)
router.patch('/tecnicos/:id', updateTecnico)
router.delete('/tecnicos/:id', deleteTecnico)

export { router as tecnicosRoutes }
