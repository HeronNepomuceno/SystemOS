import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import EventIcon from '@mui/icons-material/Event'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useOrdersRealtime } from '../../hooks/useOrdersRealtime'
import {
  fetchOrders as fetchOrdersList,
  ORDER_STATUS_OPTIONS,
  type Order as OrdemServico
} from '../../services/orders'

const API_BASE_URL = 'http://localhost:3333/api'

type Tecnico = {
  id: string
  nome: string
  especialidade: string
  contato: string
  ativo: boolean
}

type OrderFormData = {
  cliente_nome: string
  cliente_contato: string
  equipamento: string
  descricao_problema: string
}

type Filters = {
  status: string
  tecnico_id: string
  data_inicial: string
  data_final: string
}

type ScheduleData = {
  tecnico_id: string
  data_agendamento: string
}

type FinalizeData = {
  laudo: string
}

const emptyOrderForm: OrderFormData = {
  cliente_nome: '',
  cliente_contato: '',
  equipamento: '',
  descricao_problema: ''
}

const emptyFilters: Filters = {
  status: '',
  tecnico_id: '',
  data_inicial: '',
  data_final: ''
}

const emptyScheduleData: ScheduleData = {
  tecnico_id: '',
  data_agendamento: ''
}

const emptyFinalizeData: FinalizeData = {
  laudo: ''
}

const modalSx = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 520 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrdemServico[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTecnicos, setLoadingTecnicos] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [filters, setFilters] = useState<Filters>(emptyFilters)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrdemServico | null>(null)
  const [orderForm, setOrderForm] = useState<OrderFormData>(emptyOrderForm)

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleOrder, setScheduleOrder] = useState<OrdemServico | null>(null)
  const [scheduleForm, setScheduleForm] = useState<ScheduleData>(emptyScheduleData)

  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false)
  const [finalizeOrder, setFinalizeOrder] = useState<OrdemServico | null>(null)
  const [finalizeForm, setFinalizeForm] = useState<FinalizeData>(emptyFinalizeData)
  const tecnicosMap = tecnicos.reduce<Record<string, string>>((acc, tecnico) => {
    acc[tecnico.id] = tecnico.nome
    return acc
  }, {})

  useEffect(() => {
    fetchOrders()
  }, [filters])

  useEffect(() => {
    fetchTecnicos()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchOrdersList(filters)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const fetchTecnicos = async () => {
    try {
      setLoadingTecnicos(true)

      const response = await fetch(`${API_BASE_URL}/tecnicos`)

      if (!response.ok) {
        throw new Error('Erro ao buscar tecnicos')
      }

      const data = await response.json()
      setTecnicos(
        Array.isArray(data) ? data.filter((tecnico) => tecnico.ativo) : []
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoadingTecnicos(false)
    }
  }

  useOrdersRealtime(fetchOrders)

  const handleSelectFilterChange =
    (field: keyof Filters) => (event: SelectChangeEvent<string>) => {
      const { value } = event.target
      setFilters((current) => ({
        ...current,
        [field]: value
      }))
    }

  const handleInputFilterChange =
    (field: keyof Filters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target
      setFilters((current) => ({
        ...current,
        [field]: value
      }))
    }

  const handleScheduleSelectChange =
    (field: keyof ScheduleData) => (event: SelectChangeEvent<string>) => {
      const { value } = event.target
      setScheduleForm((current) => ({
        ...current,
        [field]: value
      }))
    }

  const handleOrderFormChange =
    (field: keyof OrderFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setOrderForm((current) => ({
        ...current,
        [field]: value
      }))
    }

  const handleScheduleChange =
    (field: keyof ScheduleData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setScheduleForm((current) => ({
        ...current,
        [field]: value
      }))
    }

  const handleFinalizeChange =
    (field: keyof FinalizeData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setFinalizeForm((current) => ({
        ...current,
        [field]: value
      }))
    }

  const openCreateModal = () => {
    setEditingOrder(null)
    setOrderForm(emptyOrderForm)
    setIsFormModalOpen(true)
  }

  const openEditModal = (order: OrdemServico) => {
    setEditingOrder(order)
    setOrderForm({
      cliente_nome: order.cliente_nome ?? '',
      cliente_contato: order.cliente_contato ?? '',
      equipamento: order.equipamento ?? '',
      descricao_problema: order.descricao_problema ?? ''
    })
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingOrder(null)
    setOrderForm(emptyOrderForm)
  }

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false)
    setScheduleOrder(null)
    setScheduleForm(emptyScheduleData)
  }

  const closeFinalizeModal = () => {
    setIsFinalizeModalOpen(false)
    setFinalizeOrder(null)
    setFinalizeForm(emptyFinalizeData)
  }

  const submitOrderForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !orderForm.cliente_nome ||
      !orderForm.cliente_contato ||
      !orderForm.equipamento ||
      !orderForm.descricao_problema
    ) {
      setError('Preencha todos os campos da ordem de serviço')
      return
    }

    if (editingOrder?.status === 'Finalizada') {
      setError('Ordens finalizadas nao podem ser editadas')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const url = editingOrder
        ? `${API_BASE_URL}/orders/${editingOrder.id}`
        : `${API_BASE_URL}/orders`

      const method = editingOrder ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderForm)
      })

      if (!response.ok) {
        throw new Error(
          editingOrder
            ? 'Erro ao atualizar ordem de servico'
            : 'Erro ao criar ordem de servico'
        )
      }

      closeFormModal()
      setSuccessMessage(
        editingOrder
          ? 'Ordem de servico atualizada com sucesso'
          : 'Ordem de servico criada com sucesso'
      )
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  const openScheduleModal = (order: OrdemServico) => {
    setScheduleOrder(order)
    setScheduleForm({
      tecnico_id: order.tecnico_id ?? '',
      data_agendamento: order.data_agendamento
        ? order.data_agendamento.slice(0, 16)
        : ''
    })
    setIsScheduleModalOpen(true)
  }

  const submitSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!scheduleOrder) {
      return
    }

    if (!scheduleForm.tecnico_id || !scheduleForm.data_agendamento) {
      setError('Informe tecnico e data de agendamento')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/orders/${scheduleOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Agendada',
          tecnico_id: scheduleForm.tecnico_id,
          data_agendamento: scheduleForm.data_agendamento
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao agendar ordem de servico')
      }

      closeScheduleModal()
      setSuccessMessage('Ordem de servico agendada com sucesso')
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  const moveToInProgress = async (order: OrdemServico) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Em Atendimento'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao iniciar atendimento')
      }

      setSuccessMessage('Atendimento iniciado com sucesso')
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  const openFinalizeModal = (order: OrdemServico) => {
    setFinalizeOrder(order)
    setFinalizeForm({
      laudo: order.laudo ?? ''
    })
    setIsFinalizeModalOpen(true)
  }

  const submitFinalize = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!finalizeOrder) {
      return
    }

    if (!finalizeForm.laudo) {
      setError('Informe o laudo para finalizar a ordem')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/orders/${finalizeOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Finalizada',
          laudo: finalizeForm.laudo
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao finalizar ordem de servico')
      }

      closeFinalizeModal()
      setSuccessMessage('Ordem de servico finalizada com sucesso')
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  const renderStatusAction = (order: OrdemServico) => {
    if (order.status === 'Aberta') {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<EventIcon />}
          onClick={() => openScheduleModal(order)}
          disabled={saving}
        >
          Agendar
        </Button>
      )
    }

    if (order.status === 'Agendada') {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          onClick={() => moveToInProgress(order)}
          disabled={saving}
        >
          Iniciar
        </Button>
      )
    }

    if (order.status === 'Em Atendimento') {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<CheckCircleIcon />}
          onClick={() => openFinalizeModal(order)}
          disabled={saving}
        >
          Finalizar
        </Button>
      )
    }

    return <Typography variant="body2">-</Typography>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' }
          }}
        >
          <Typography variant="h5">Ordens de Servico</Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Nova OS
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Select
              displayEmpty
              value={filters.status}
              onChange={handleSelectFilterChange('status')}
              fullWidth
            >
              <MenuItem value="">Todos os status</MenuItem>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>

            <FormControl fullWidth>
              <InputLabel id="tecnico-filter-label">Tecnico</InputLabel>
              <Select
                labelId="tecnico-filter-label"
                value={filters.tecnico_id}
                label="Tecnico"
                onChange={handleSelectFilterChange('tecnico_id')}
              >
                <MenuItem value="">Todos os tecnicos</MenuItem>
                {tecnicos.map((tecnico) => (
                  <MenuItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Data inicial"
              type="date"
              value={filters.data_inicial}
              onChange={handleInputFilterChange('data_inicial')}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              fullWidth
              label="Data final"
              type="date"
              value={filters.data_final}
              onChange={handleInputFilterChange('data_final')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Equipamento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tecnico</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell>Acoes</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 3 }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma ordem encontrada
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.cliente_nome}</TableCell>
                    <TableCell>{order.equipamento}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      {order.tecnico_id ? tecnicosMap[order.tecnico_id] || '-' : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(order.criado_em).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditIcon />}
                          onClick={() => openEditModal(order)}
                          disabled={order.status === 'Finalizada' || saving}
                        >
                          Editar
                        </Button>
                        {renderStatusAction(order)}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Modal open={isFormModalOpen} onClose={closeFormModal}>
        <Box sx={modalSx} component="form" onSubmit={submitOrderForm}>
          <Stack spacing={2}>
            <Typography variant="h6">
              {editingOrder ? 'Editar OS' : 'Nova OS'}
            </Typography>

            <TextField
              label="Cliente"
              value={orderForm.cliente_nome}
              onChange={handleOrderFormChange('cliente_nome')}
              fullWidth
              required
              disabled={saving || editingOrder?.status === 'Finalizada'}
            />

            <TextField
              label="Contato"
              value={orderForm.cliente_contato}
              onChange={handleOrderFormChange('cliente_contato')}
              fullWidth
              required
              disabled={saving || editingOrder?.status === 'Finalizada'}
            />

            <TextField
              label="Equipamento"
              value={orderForm.equipamento}
              onChange={handleOrderFormChange('equipamento')}
              fullWidth
              required
              disabled={saving || editingOrder?.status === 'Finalizada'}
            />

            <TextField
              label="Descricao do problema"
              value={orderForm.descricao_problema}
              onChange={handleOrderFormChange('descricao_problema')}
              fullWidth
              required
              multiline
              minRows={3}
              disabled={saving || editingOrder?.status === 'Finalizada'}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button onClick={closeFormModal} disabled={saving}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || editingOrder?.status === 'Finalizada'}
              >
                {editingOrder ? 'Salvar' : 'Criar'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <Modal open={isScheduleModalOpen} onClose={closeScheduleModal}>
        <Box sx={modalSx} component="form" onSubmit={submitSchedule}>
          <Stack spacing={2}>
            <Typography variant="h6">Agendar OS</Typography>

            <Select
              displayEmpty
              value={scheduleForm.tecnico_id}
              onChange={handleScheduleSelectChange('tecnico_id')}
              fullWidth
              required
              disabled={saving || loadingTecnicos}
            >
              <MenuItem value="">
                {loadingTecnicos
                  ? 'Carregando tecnicos...'
                  : 'Selecione um tecnico'}
              </MenuItem>
              {tecnicos.map((tecnico) => (
                <MenuItem key={tecnico.id} value={tecnico.id}>
                  {tecnico.nome}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Data de agendamento"
              type="datetime-local"
              value={scheduleForm.data_agendamento}
              onChange={handleScheduleChange('data_agendamento')}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={saving}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button onClick={closeScheduleModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                Confirmar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <Modal open={isFinalizeModalOpen} onClose={closeFinalizeModal}>
        <Box sx={modalSx} component="form" onSubmit={submitFinalize}>
          <Stack spacing={2}>
            <Typography variant="h6">Finalizar OS</Typography>

            <TextField
              label="Laudo"
              value={finalizeForm.laudo}
              onChange={handleFinalizeChange('laudo')}
              fullWidth
              required
              multiline
              minRows={4}
              disabled={saving}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button onClick={closeFinalizeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                Confirmar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
