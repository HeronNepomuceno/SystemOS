import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Modal,
  Paper,
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
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'

const API_BASE_URL = 'http://localhost:3333/api'

type Tecnico = {
  id: string
  nome: string
  especialidade: string
  contato: string
  ativo: boolean
}

type TecnicoFormData = {
  nome: string
  especialidade: string
  contato: string
}

const emptyTecnicoForm: TecnicoFormData = {
  nome: '',
  especialidade: '',
  contato: ''
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

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<TecnicoFormData>(emptyTecnicoForm)

  useEffect(() => {
    fetchTecnicos()
  }, [])

  const fetchTecnicos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/tecnicos`)

      if (!response.ok) {
        throw new Error('Erro ao buscar tecnicos')
      }

      const data = await response.json()
      setTecnicos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange =
    (field: keyof TecnicoFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target
      setFormData((current) => ({
        ...current,
        [field]: value
      }))
    }

  const openModal = () => {
    setFormData(emptyTecnicoForm)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData(emptyTecnicoForm)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.nome || !formData.especialidade || !formData.contato) {
      setError('Preencha todos os campos do tecnico')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/tecnicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar tecnico')
      }

      closeModal()
      setSuccessMessage('Tecnico criado com sucesso')
      await fetchTecnicos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
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
          <Typography variant="h5">Tecnicos</Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTecnicos}
              disabled={loading}
            >
              Recarregar
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openModal}
            >
              Novo Tecnico
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Especialidade</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ py: 3 }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : tecnicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum tecnico encontrado
                  </TableCell>
                </TableRow>
              ) : (
                tecnicos.map((tecnico) => (
                  <TableRow key={tecnico.id}>
                    <TableCell>{tecnico.nome}</TableCell>
                    <TableCell>{tecnico.especialidade}</TableCell>
                    <TableCell>{tecnico.contato}</TableCell>
                    <TableCell>
                      <Chip
                        label={tecnico.ativo ? 'Ativo' : 'Inativo'}
                        color={tecnico.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={modalSx} component="form" onSubmit={submitForm}>
          <Stack spacing={2}>
            <Typography variant="h6">Novo Tecnico</Typography>

            <TextField
              label="Nome"
              value={formData.nome}
              onChange={handleFormChange('nome')}
              fullWidth
              required
              disabled={saving}
            />

            <TextField
              label="Especialidade"
              value={formData.especialidade}
              onChange={handleFormChange('especialidade')}
              fullWidth
              required
              disabled={saving}
            />

            <TextField
              label="Contato"
              value={formData.contato}
              onChange={handleFormChange('contato')}
              fullWidth
              required
              disabled={saving}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                Criar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
