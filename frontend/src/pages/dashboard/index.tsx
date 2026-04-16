import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const API_BASE_URL = 'http://localhost:3333/api'
const MS_PER_HOUR = 1000 * 60 * 60
const MS_PER_DAY = MS_PER_HOUR * 24

type OrderStatus =
  | 'Aberta'
  | 'Agendada'
  | 'Em Atendimento'
  | 'Finalizada'
  | 'Cancelada'

type Order = {
  id: string
  status: OrderStatus
  tecnico_id: string | null
  criado_em: string
  atualizado_em?: string | null
}

type Tecnico = {
  id: string
  nome: string
}

type StatusCard = {
  label: string
  subtitle: string
  value: number
  color: 'primary' | 'warning' | 'success'
}

type TechnicianChartItem = {
  tecnico: string
  quantidade: number
}

type PeriodCard = {
  label: string
  value: number
}

const formatAverageTime = (averageMs: number) => {
  if (!Number.isFinite(averageMs) || averageMs <= 0) {
    return '0h'
  }

  if (averageMs >= MS_PER_DAY) {
    return `${(averageMs / MS_PER_DAY).toFixed(1)} dias`
  }

  return `${(averageMs / MS_PER_HOUR).toFixed(1)}h`
}

const truncateLabel = (value: string, maxLength = 16) => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}...`
}

const countOpenScheduledSince = (orders: Order[], days: number) => {
  const threshold = Date.now() - days * MS_PER_DAY

  return orders.filter((order) => {
    if (order.status !== 'Aberta' && order.status !== 'Agendada') {
      return false
    }

    const createdAt = new Date(order.criado_em).getTime()
    return Number.isFinite(createdAt) && createdAt >= threshold
  }).length
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [ordersResponse, tecnicosResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/orders`),
          fetch(`${API_BASE_URL}/tecnicos`)
        ])

        if (!ordersResponse.ok) {
          throw new Error('Erro ao buscar ordens de serviço')
        }

        if (!tecnicosResponse.ok) {
          throw new Error('Erro ao buscar tecnicos')
        }

        const [ordersData, tecnicosData] = await Promise.all([
          ordersResponse.json(),
          tecnicosResponse.json()
        ])

        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setTecnicos(Array.isArray(tecnicosData) ? tecnicosData : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado')
        setOrders([])
        setTecnicos([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const tecnicosMap = tecnicos.reduce<Record<string, string>>((acc, tecnico) => {
    acc[tecnico.id] = tecnico.nome
    return acc
  }, {})

  const statusCards: StatusCard[] = [
    {
      label: 'Ordens Abertas',
      subtitle: 'Aguardando atendimento',
      value: orders.filter((order) => order.status === 'Aberta').length,
      color: 'primary'
    },
    {
      label: 'Ordens Agendadas',
      subtitle: 'Com data definida',
      value: orders.filter((order) => order.status === 'Agendada').length,
      color: 'warning'
    },
    {
      label: 'Ordens Finalizadas',
      subtitle: 'Concluidas com sucesso',
      value: orders.filter((order) => order.status === 'Finalizada').length,
      color: 'success'
    }
  ]

  const finalizedDurations = orders.reduce<number[]>((acc, order) => {
    if (order.status !== 'Finalizada' || !order.atualizado_em) {
      return acc
    }

    const createdAt = new Date(order.criado_em).getTime()
    const updatedAt = new Date(order.atualizado_em).getTime()

    if (!Number.isFinite(createdAt) || !Number.isFinite(updatedAt)) {
      return acc
    }

    acc.push(Math.max(updatedAt - createdAt, 0))
    return acc
  }, [])

  const averageTimeMs =
    finalizedDurations.length > 0
      ? finalizedDurations.reduce((total, duration) => total + duration, 0) /
        finalizedDurations.length
      : 0

  const technicianCountMap = orders.reduce<Record<string, number>>(
    (acc, order) => {
      if (order.status !== 'Finalizada' || !order.tecnico_id) {
        return acc
      }

      acc[order.tecnico_id] = (acc[order.tecnico_id] ?? 0) + 1
      return acc
    },
    {}
  )

  const finalizedByTechnician: TechnicianChartItem[] = Object.entries(
    technicianCountMap
  )
    .map(([tecnico, quantidade]) => ({
      tecnico: tecnicosMap[tecnico] || '-',
      quantidade
    }))
    .sort((a, b) => b.quantidade - a.quantidade)

  const periodCards: PeriodCard[] = [
    {
      label: 'Ultimos 7 dias',
      value: countOpenScheduledSince(orders, 7)
    },
    {
      label: 'Ultimos 15 dias',
      value: countOpenScheduledSince(orders, 15)
    },
    {
      label: 'Ultimos 30 dias',
      value: countOpenScheduledSince(orders, 30)
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Estatisticas gerais das ordens de servico
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box
            sx={{
              minHeight: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {statusCards.map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Chip
                      label={card.label}
                      color={card.color}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h3" sx={{ mb: 0.5 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="h6">{card.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Media de Tempo para Finalizacao
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {formatAverageTime(averageTimeMs)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Considera apenas ordens com status Finalizada
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    OS por Periodo
                  </Typography>

                  <Grid container spacing={2}>
                    {periodCards.map((card) => (
                      <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {card.label}
                          </Typography>
                          <Typography variant="h4">{card.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    OS Finalizadas por Tecnico
                  </Typography>

                  {finalizedByTechnician.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma ordem finalizada encontrada.
                    </Typography>
                  ) : (
                    <Box sx={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer>
                        <BarChart data={finalizedByTechnician}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="tecnico"
                            tickFormatter={(value) => truncateLabel(String(value))}
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip
                            formatter={(value) => [value, 'Quantidade']}
                            labelFormatter={(label) => `Tecnico: ${label || '-'}`}
                          />
                          <Bar dataKey="quantidade" fill="#1976d2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  )
}
