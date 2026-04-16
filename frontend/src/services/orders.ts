const API_BASE_URL = 'http://localhost:3333/api'

export const ORDER_STATUS_OPTIONS = [
  'Aberta',
  'Agendada',
  'Em Atendimento',
  'Finalizada',
  'Cancelada'
] as const

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number]

export type Order = {
  id: string | number
  cliente_nome: string
  cliente_contato: string
  equipamento: string
  descricao_problema: string
  status: OrderStatus
  tecnico_id: string | null
  tecnico_nome?: string | null
  criado_em: string
  atualizado_em?: string | null
  data_agendamento?: string | null
  laudo?: string | null
}

export type FetchOrdersFilters = {
  status?: string
  tecnico_id?: string
  data_inicial?: string
  data_final?: string
}

export async function fetchOrders(filters: FetchOrdersFilters = {}) {
  const params = new URLSearchParams()

  if (filters.status) params.set('status', filters.status)
  if (filters.tecnico_id) params.set('tecnico_id', filters.tecnico_id)
  if (filters.data_inicial) params.set('data_inicial', filters.data_inicial)
  if (filters.data_final) params.set('data_final', filters.data_final)

  const queryString = params.toString()
  const response = await fetch(
    `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar ordens de serviço')
  }

  const data = await response.json()
  return Array.isArray(data) ? (data as Order[]) : []
}
