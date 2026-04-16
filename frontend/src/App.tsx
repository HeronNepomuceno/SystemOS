import { AppBar, Box, Button, Toolbar } from '@mui/material'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import DashboardPage from './pages/dashboard'
import OrdersPage from './pages/orders'
import TecnicosPage from './pages/tecnicos'

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    matches: ['/', '/dashboard'] as string[]
  },
  {
    label: 'Ordens de Serviço',
    path: '/ordens-de-servico',
    matches: ['/ordens-de-servico'] as string[]
  },
  {
    label: 'Técnicos',
    path: '/tecnicos',
    matches: ['/tecnicos'] as string[]
  }
] as const

function App() {
  const location = useLocation()

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          {navigationItems.map((item) => {
            const isActive = item.matches.includes(location.pathname)

            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                variant={isActive ? 'outlined' : 'text'}
                sx={{
                  borderColor: isActive ? 'common.white' : 'transparent'
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ordens-de-servico" element={<OrdersPage />} />
        <Route path="/tecnicos" element={<TecnicosPage />} />
      </Routes>
    </Box>
  )
}

export default App
