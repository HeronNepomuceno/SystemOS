import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/dashboard'
import OrdersPage from './pages/orders'
import TecnicosPage from './pages/tecnicos'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/ordens-de-servico" element={<OrdersPage />} />
      <Route path="/tecnicos" element={<TecnicosPage />} />
    </Routes>
  )
}

export default App
