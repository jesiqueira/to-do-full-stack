import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthScreen } from './pages/AuthScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
      </Routes>
    </Router>
  )
}

export default App
