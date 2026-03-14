import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import Home from './pages/Home.jsx'
import Setup from './pages/Setup.jsx'

const Lobby = lazy(() => import('./pages/Lobby.jsx'))
const Game = lazy(() => import('./pages/Game.jsx'))

const BASE = '/Scotland-Yard'

function App() {
  return (
    <BrowserRouter basename={BASE}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/lobby/:code" element={<Lobby />} />
            <Route path="/game/:code" element={<Game />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
