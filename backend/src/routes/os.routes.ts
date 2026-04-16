import { Router } from 'express'
import {
  createOS,
  listOS,
  getOSById,
  updateOS,
  deleteOS
} from '../controllers'

const router = Router()

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List service orders
 *     description: Returns the list of service orders with optional filters.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filter by order status (Aberta, Agendada, Em Atendimento, Finalizada, Cancelada)
 *         schema:
 *           type: string
 *         example: Aberta
 *       - in: query
 *         name: tecnico_id
 *         required: false
 *         description: Filter by technician ID
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *       - in: query
 *         name: data_inicial
 *         required: false
 *         description: Filter orders created after this date
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2026-04-01T00:00:00.000Z
 *       - in: query
 *         name: data_final
 *         required: false
 *         description: Filter orders created before this date
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2026-04-30T23:59:59.000Z
 *     responses:
 *       200:
 *         description: List of service orders
 *         content:
 *           application/json:
 *             example:
 *               - id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 cliente_nome: Maria Silva
 *                 cliente_contato: 85999999999
 *                 equipamento: Notebook Dell
 *                 descricao_problema: Nao liga
 *                 status: Aberta
 *                 tecnico_id: null
 *                 criado_em: 2026-04-16T12:00:00.000Z
 *                 atualizado_em: null
 *   post:
 *     summary: Create a service order
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             cliente_nome: Maria Silva
 *             cliente_contato: 85999999999
 *             equipamento: Notebook Dell
 *             descricao_problema: Nao liga
 *     responses:
 *       201:
 *         description: Service order created successfully
 *         content:
 *           application/json:
 *             example:
 *               - id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 cliente_nome: Maria Silva
 *                 cliente_contato: 85999999999
 *                 equipamento: Notebook Dell
 *                 descricao_problema: Nao liga
 *                 status: Aberta
 *                 tecnico_id: null
 *                 criado_em: 2026-04-16T12:00:00.000Z
 *                 atualizado_em: null
 */
router.post('/orders', createOS)
router.get('/orders', listOS)

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update a service order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: Finalizada
 *             tecnico_id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *             laudo: Equipamento reparado e testado
 *     responses:
 *       200:
 *         description: Updated service order
 *         content:
 *           application/json:
 *             example:
 *               id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               cliente_nome: Maria Silva
 *               cliente_contato: 85999999999
 *               equipamento: Notebook Dell
 *               descricao_problema: Nao liga
 *               status: Finalizada
 *               tecnico_id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               criado_em: 2026-04-16T12:00:00.000Z
 *               atualizado_em: 2026-04-17T15:30:00.000Z
 *               laudo: Equipamento reparado e testado
 *   delete:
 *     summary: Delete a service order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Service order ID
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/orders/:id', getOSById)
router.patch('/orders/:id', updateOS)
router.delete('/orders/:id', deleteOS)

export { router as osRoutes }
