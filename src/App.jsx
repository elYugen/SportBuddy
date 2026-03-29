import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import WorkoutDetail from './pages/WorkoutDetail'
import Profile from './pages/Profile'

function App() {
  return (
    <div className="min-h-screen bg-app-bg text-text-main pb-[80px]">
      <div className="max-w-md mx-auto w-full h-full relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/:id" element={<WorkoutDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default App
