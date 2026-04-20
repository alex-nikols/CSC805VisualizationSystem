import { Routes, Route, Navigate } from 'react-router-dom'
import Explorer from './pages/Explorer'
import Analytics from './pages/Analytics'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/explorer" replace />} />
      <Route path="/explorer" element={<Explorer />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
