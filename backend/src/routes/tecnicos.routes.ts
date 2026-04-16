import { Router } from 'express'
import {
  createTecnico,
  listTecnicos,
  getTecnicoById,
  updateTecnico,
  deleteTecnico
} from '../controllers'

const router = Router()

/**
 * @swagger
 * /tecnicos:
 *   get:
 *     summary: List technicians
 *     description: Returns the list of technicians.
 *     tags:
 *       - Technicians
 *     responses:
 *       200:
 *         description: List of technicians
 *         content:
 *           application/json:
 *             example:
 *               - id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 nome: Joao Pereira
 *                 especialidade: Impressoras
 *                 contato: 85988888888
 *                 ativo: true
 *                 criado_em: 2026-04-16T12:00:00.000Z
 *   post:
 *     summary: Create a technician
 *     tags:
 *       - Technicians
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: Joao Pereira
 *             especialidade: Impressoras
 *             contato: 85988888888
 *             ativo: true
 *     responses:
 *       201:
 *         description: Technician created successfully
 *         content:
 *           application/json:
 *             example:
 *               - id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 nome: Joao Pereira
 *                 especialidade: Impressoras
 *                 contato: 85988888888
 *                 ativo: true
 *                 criado_em: 2026-04-16T12:00:00.000Z
 */
router.post('/tecnicos', createTecnico)
router.get('/tecnicos', listTecnicos)
router.get('/tecnicos/:id', getTecnicoById)
router.patch('/tecnicos/:id', updateTecnico)
router.delete('/tecnicos/:id', deleteTecnico)

export { router as tecnicosRoutes }
