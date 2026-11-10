
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Inventory from './pages/Inventory'
import Feedback from './pages/Feedback'
import Assistant from './pages/Assistant'
import Marketing from './pages/Marketing'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Topbar />

          <main className="p-5 sm:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />

        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
