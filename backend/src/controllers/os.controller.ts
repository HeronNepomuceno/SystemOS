import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const allowedStatuses = [
  'Aberta',
  'Agendada',
  'Em Atendimento',
  'Finalizada',
  'Cancelada'
]

const parseDateQuery = (value: unknown): string | null => {
  if (!value) return null
  const dateValue = Array.isArray(value) ? value[0] : value
  if (typeof dateValue !== 'string') return null
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const parseStringQuery = (value: unknown): string | undefined => {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : String(value)
}

const parseNumberQuery = (value: unknown): number | undefined => {
  const stringValue = parseStringQuery(value)
  if (!stringValue) return undefined
  const numberValue = Number(stringValue)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

export const createOS = async (req: Request, res: Response) => {
  const {
    cliente_nome,
    cliente_contato,
    equipamento,
    descricao_problema
  } = req.body

  if (!cliente_nome || !cliente_contato || !equipamento || !descricao_problema) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' })
  }

  const { data, error } = await supabase
    .from('ordens_de_servico')
    .insert([
      {
        cliente_nome,
        cliente_contato,
        equipamento,
        descricao_problema,
        status: 'Aberta'
      }
    ])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json(data)
}

export const listOS = async (req: Request, res: Response) => {
  const status = parseStringQuery(req.query.status)
  const tecnicoId = parseStringQuery(req.query.tecnico_id)
  const dataInicial = parseDateQuery(req.query.data_inicial)
  const dataFinal = parseDateQuery(req.query.data_final)

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' })
  }

  if (tecnicoId && !uuidRegex.test(tecnicoId)) {
    return res.status(400).json({ error: 'tecnico_id inválido' })
  }

  if (dataInicial && dataFinal) {
    if (new Date(dataInicial) > new Date(dataFinal)) {
      return res.status(400).json({ error: 'Intervalo de datas inválido' })
    }
  }

  let query = supabase
    .from('ordens_de_servico')
    .select('*')

  if (status) {
    query = query.eq('status', status)
  }

  if (tecnicoId) {
    query = query.eq('tecnico_id', tecnicoId)
  }

  if (dataInicial) {
    query = query.gte('criado_em', dataInicial)
  }

  if (dataFinal) {
    query = query.lte('criado_em', dataFinal)
  }

  const { data, error } = await query.order('criado_em', {
    ascending: false
  })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}

export const getOSById = async (req: Request, res: Response) => {
  const osId = req.params.id as string
  
  if (!osId || !uuidRegex.test(osId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  const { data, error } = await supabase
    .from('ordens_de_servico')
    .select()
    .eq('id', osId)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' })
  }

  return res.status(200).json(data)
}

export const updateOS = async (req: Request, res: Response) => {
  const osId = req.params.id as string
  
  if (!osId || !uuidRegex.test(osId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  const {
    cliente_nome,
    cliente_contato,
    equipamento,
    descricao_problema,
    status,
    tecnico_id,
    data_agendamento,
    laudo
  } = req.body

  const updates: Record<string, unknown> = {}

  if (cliente_nome !== undefined) updates.cliente_nome = cliente_nome
  if (cliente_contato !== undefined) updates.cliente_contato = cliente_contato
  if (equipamento !== undefined) updates.equipamento = equipamento
  if (descricao_problema !== undefined) updates.descricao_problema = descricao_problema
  if (status !== undefined) updates.status = status
  if (tecnico_id !== undefined) updates.tecnico_id = tecnico_id
  if (data_agendamento !== undefined) updates.data_agendamento = data_agendamento
  if (laudo !== undefined) updates.laudo = laudo

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' })
  }

  if (status !== undefined && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' })
  }

  if (status === 'Finalizada' && (laudo === undefined || laudo === null || laudo === '')) {
    return res.status(400).json({ error: 'É necessário fornecer o campo laudo para finalizar a OS' })
  }

  if (data_agendamento !== undefined && data_agendamento !== null) {
    const date = new Date(String(data_agendamento))
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Data de agendamento inválida' })
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from('ordens_de_servico')
    .select()
    .eq('id', osId)
    .single()

  if (existingError) {
    return res.status(500).json({ error: existingError.message })
  }

  if (!existing) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' })
  }

  if (existing.status === 'Finalizada') {
    return res.status(400).json({ error: 'Não é permitido atualizar uma OS finalizada' })
  }

  updates.atualizado_em = new Date().toISOString();

  const { data, error } = await supabase
    .from('ordens_de_servico')
    .update(updates)
    .eq('id', osId)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}

export const deleteOS = async (req: Request, res: Response) => {
  const osId = req.params.id as string
  
  if (!osId || !uuidRegex.test(osId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  
  const { data, error } = await supabase
    .from('ordens_de_servico')
    .delete()
    .eq('id', osId)
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' })
  }

  return res.status(204).send()
}
