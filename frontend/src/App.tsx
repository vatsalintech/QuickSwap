import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './components/authenticate/Signup'
import Signin from './components/authenticate/Signin'
import LandingPage from './components/landingPage/landing_page'
import ProfilePage from './components/profilePage/profile_page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App