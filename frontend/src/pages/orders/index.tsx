import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box
} from '@mui/material'

type OrdemServico = {
  id: string
  cliente_nome: string
  cliente_contato: string
  equipamento: string
  descricao_problema: string
  status: string
  tecnico_id: string | null
  criado_em: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const response = await fetch('http://localhost:3333/api/orders')

      if (!response.ok) {
        throw new Error('Erro ao buscar ordens de serviço')
      }

      const data = await response.json()
      setOrders(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifycontent="center" mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={4}>
        {error}
      </Typography>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Ordens de Serviço
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Equipamento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.cliente_nome}</TableCell>
                <TableCell>{order.equipamento}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.tecnico_id || '-'}</TableCell>
                <TableCell>
                  {new Date(order.criado_em).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}