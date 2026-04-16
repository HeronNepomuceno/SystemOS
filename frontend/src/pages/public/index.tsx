import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { useOrdersRealtime } from '../../hooks/useOrdersRealtime'
import { fetchOrders, type Order } from '../../services/orders'

const API_BASE_URL = 'http://localhost:3333/api'

const statusColorMap: Record<
  Order['status'],
  'default' | 'error' | 'info' | 'success' | 'warning'
> = {
  Aberta: 'info',
  Agendada: 'warning',
  'Em Atendimento': 'info',
  Finalizada: 'success',
  Cancelada: 'default'
}

const formatScheduledDate = (value?: string | null) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

export default function PublicOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tecnicosMap, setTecnicosMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const loadTecnicos = async () => {
    const response = await fetch(`${API_BASE_URL}/tecnicos`)

    if (!response.ok) {
      throw new Error('Erro ao buscar tecnicos')
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      setTecnicosMap({})
      return
    }

    const nextMap = data.reduce<Record<string, string>>((acc, tecnico) => {
      if (tecnico?.id && tecnico?.nome) {
        acc[tecnico.id] = tecnico.nome
      }

      return acc
    }, {})

    setTecnicosMap(nextMap)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([loadOrders(), loadTecnicos()])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado')
      }
    }

    void loadInitialData()
  }, [])

  useOrdersRealtime(loadOrders)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        py: { xs: 3, md: 6 }
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Acompanhamento de Ordens de Serviço
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Painel público com atualização automática em tempo real.
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Equipamento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Data de agendamento</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 5 }}>
                        <CircularProgress size={30} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhuma ordem encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.cliente_nome || '-'}</TableCell>
                      <TableCell>{order.equipamento || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={statusColorMap[order.status]}
                          size="small"
                          variant={order.status === 'Cancelada' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        {order.tecnico_nome ||
                          (order.tecnico_id ? tecnicosMap[order.tecnico_id] : null) ||
                          '-'}
                      </TableCell>
                      <TableCell>
                        {formatScheduledDate(order.data_agendamento)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </Box>
  )
}
