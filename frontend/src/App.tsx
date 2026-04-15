import { Routes, Route } from 'react-router-dom'
import OrdersPage from './pages/orders'

function App() {
  return (
    <Routes>
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>
  )
}

export default App