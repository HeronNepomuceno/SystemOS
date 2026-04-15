import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const parseStringQuery = (value: unknown): string | undefined => {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : String(value)
}

const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) return undefined
  const stringValue = Array.isArray(value) ? value[0] : String(value)
  const normalized = stringValue.toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

export const createTecnico = async (req: Request, res: Response) => {
  const { nome, especialidade, contato, ativo = true } = req.body

  if (!nome || !especialidade || !contato) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' })
  }

  if (typeof ativo !== 'boolean') {
    return res.status(400).json({ error: 'Campo ativo deve ser booleano' })
  }

  const { data, error } = await supabase
    .from('tecnicos')
    .insert([
      {
        nome,
        especialidade,
        contato,
        ativo
      }
    ])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json(data)
}

export const listTecnicos = async (req: Request, res: Response) => {
  const ativoQuery = parseBooleanQuery(req.query.ativo)
  const especialidade = parseStringQuery(req.query.especialidade)

  if (req.query.ativo !== undefined && ativoQuery === undefined) {
    return res.status(400).json({ error: 'Valor inválido para ativo' })
  }

  const query = supabase.from('tecnicos').select()

  if (ativoQuery !== undefined) {
    query.eq('ativo', ativoQuery)
  }

  if (especialidade) {
    query.eq('especialidade', especialidade)
  }

  const { data, error } = await query.order('criado_em', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}

export const getTecnicoById = async (req: Request, res: Response) => {
  const tecnicoId = req.params.id as string

  if (!tecnicoId || !uuidRegex.test(tecnicoId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  const { data, error } = await supabase
    .from('tecnicos')
    .select()
    .eq('id', tecnicoId)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Técnico não encontrado' })
  }

  return res.status(200).json(data)
}

export const updateTecnico = async (req: Request, res: Response) => {
  const tecnicoId = req.params.id as string

  if (!tecnicoId || !uuidRegex.test(tecnicoId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  const allowedFields = ['nome', 'especialidade', 'contato', 'ativo']
  const invalidField = Object.keys(req.body).find(
    (field) => !allowedFields.includes(field)
  )

  if (invalidField) {
    return res.status(400).json({ error: `Campo inválido: ${invalidField}` })
  }

  const updates: Record<string, unknown> = {}

  if (req.body.nome !== undefined) updates.nome = req.body.nome
  if (req.body.especialidade !== undefined)
    updates.especialidade = req.body.especialidade
  if (req.body.contato !== undefined) updates.contato = req.body.contato

  if (req.body.ativo !== undefined) {
    if (typeof req.body.ativo !== 'boolean') {
      return res.status(400).json({ error: 'Campo ativo deve ser booleano' })
    }
    updates.ativo = req.body.ativo
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' })
  }

  const { data, error } = await supabase
    .from('tecnicos')
    .update(updates)
    .eq('id', tecnicoId)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Técnico não encontrado' })
  }

  return res.status(200).json(data)
}

export const deleteTecnico = async (req: Request, res: Response) => {
  const tecnicoId = req.params.id as string

  if (!tecnicoId || !uuidRegex.test(tecnicoId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  const { data, error } = await supabase
    .from('tecnicos')
    .delete()
    .eq('id', tecnicoId)
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Técnico não encontrado' })
  }

  return res.status(204).send()
}
