// src/__tests__/os.controller.test.ts

import { Request, Response } from 'express'
import { createOS, listOS, updateOS } from '../controllers/os.controller'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

import { supabase } from '../config/supabase'

const mockChain = (finalResult: { data: any; error: any }) => {
  const chain: any = {}

  chain.eq = jest.fn().mockReturnValue(chain)
  chain.gte = jest.fn().mockReturnValue(chain)
  chain.lte = jest.fn().mockReturnValue(chain)
  chain.insert = jest.fn().mockReturnValue(chain)
  chain.update = jest.fn().mockReturnValue(chain)
  chain.delete = jest.fn().mockReturnValue(chain)
  chain.single = jest.fn<() => Promise<any>>().mockResolvedValue(finalResult)
  chain.order = jest.fn<() => Promise<any>>().mockResolvedValue(finalResult)

  // select por último, depois que eq e single já existem no chain
  chain.select = jest.fn().mockReturnValue(chain)

  return chain
}

// Helper para criar mocks de req/res sem boilerplate nos testes
const makeMocks = (params = {}, body = {}, query = {}) => {
  const req = { params, body, query } as unknown as Request
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response
  return { req, res }
}


// ============================================================
// createOS
// ============================================================

it('deve criar uma OS com sucesso', async () => {
  const body = {
    cliente_nome: 'Maria',
    cliente_contato: '85999999999',
    equipamento: 'Notebook',
    descricao_problema: 'Problema',
  }

  const fakeOS = [{ id: '111064b0-2218-45d4-93e4-8b85ae6c8111', ...body, status: 'Aberta' }]

  const chain = mockChain({ data: fakeOS, error: null })

  // 👇 força retorno direto no final da chain
  chain.select = jest.fn<any>().mockResolvedValue({ data: fakeOS, error: null })

  ;(supabase.from as jest.Mock).mockReturnValue(chain)

  const { req, res } = makeMocks({}, body)

  await createOS(req, res)

  expect(res.status).toHaveBeenCalledWith(201)
})

describe('createOS', () => {
  it('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
    const { req, res } = makeMocks({}, { cliente_nome: 'Maria' }) // faltam 3 campos

    await createOS(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Dados obrigatórios faltando' })
  })
})

// ============================================================
// listOS
// ============================================================
describe('listOS', () => {
  it('deve retornar 400 para status inválido', async () => {
    const { req, res } = makeMocks({}, {}, { status: 'Invalido' })

    await listOS(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Status inválido' })
  })

  it('deve retornar 400 se data_inicial for maior que data_final', async () => {
    const { req, res } = makeMocks({}, {}, {
      data_inicial: '2026-05-01',
      data_final: '2026-04-01',
    })

    await listOS(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Intervalo de datas inválido' })
  })

  it('deve retornar 200 com a lista de OS sem filtros', async () => {
    const fakeList = [{ id: 'uuid-1', status: 'Aberta' }]
    const chain = mockChain({ data: fakeList, error: null })
    ;(supabase.from as jest.Mock).mockReturnValue(chain)

    const { req, res } = makeMocks()
    await listOS(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(fakeList)
  })

  it('deve aplicar filtro de status quando fornecido', async () => {
    const fakeList = [{ id: 'uuid-1', status: 'Finalizada' }]
    const chain = mockChain({ data: fakeList, error: null })
    ;(supabase.from as jest.Mock).mockReturnValue(chain)

    const { req, res } = makeMocks({}, {}, { status: 'Finalizada' })
    await listOS(req, res)

    expect(chain.eq).toHaveBeenCalledWith('status', 'Finalizada')
    expect(res.status).toHaveBeenCalledWith(200)
  })
})

// ============================================================
// updateOS
// ============================================================
describe('updateOS', () => {
  it('deve retornar 400 para ID inválido', async () => {
    const { req, res } = makeMocks({ id: 'nao-e-uuid' }, { status: 'Aberta' })

    await updateOS(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'ID inválido' })
  })

  it('deve retornar 400 ao tentar finalizar OS sem laudo', async () => {
    const validId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    const { req, res } = makeMocks({ id: validId }, { status: 'Finalizada' }) // sem laudo

    await updateOS(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'É necessário fornecer o campo laudo para finalizar a OS',
    })
  })

  it('deve retornar 400 ao tentar atualizar uma OS já finalizada', async () => {
    const validId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    const existingOS = { id: validId, status: 'Finalizada' }

    // Primeira chamada ao Supabase é o SELECT para buscar a OS existente
    const chain = mockChain({ data: existingOS, error: null })
    ;(supabase.from as jest.Mock).mockReturnValue(chain)

    const { req, res } = makeMocks({ id: validId }, { status: 'Aberta' })
    await updateOS(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Não é permitido atualizar uma OS finalizada',
    })
  })

  it('deve atualizar a OS com sucesso e retornar 200', async () => {
    const validId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    const existingOS = { id: validId, status: 'Em Atendimento' }
    const updatedOS = { ...existingOS, status: 'Finalizada', laudo: 'Reparado' }

    // O controller chama .from() duas vezes: SELECT e UPDATE
    // Precisamos retornar resultados diferentes para cada chamada
    ;(supabase.from as jest.Mock)
      .mockReturnValueOnce(mockChain({ data: existingOS, error: null })) // SELECT
      .mockReturnValueOnce(mockChain({ data: updatedOS, error: null }))  // UPDATE

    const { req, res } = makeMocks(
      { id: validId },
      { status: 'Finalizada', laudo: 'Reparado' }
    )
    await updateOS(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(updatedOS)
  })

  it('deve retornar 404 se a OS não existir', async () => {
    const validId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    const chain = mockChain({ data: null, error: null })
    ;(supabase.from as jest.Mock).mockReturnValue(chain)

    const { req, res } = makeMocks({ id: validId }, { status: 'Aberta' })
    await updateOS(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })
})