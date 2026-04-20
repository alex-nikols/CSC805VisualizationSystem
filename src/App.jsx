import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Explorer from './pages/Explorer'
import Analytics from './pages/Analytics'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/explorer" replace />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  )
}
