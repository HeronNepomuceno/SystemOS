import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export const createOS = async (req: Request, res: Response) => {
  const {
    cliente_nome,
    cliente_contato,
    equipamento,
    descricao_problema
  } = req.body

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