import React from 'react'
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import InterviewP from "./pages/InterviewP"
import Profile from "./pages/Profile.jsx"

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/interviewp/:sessionId' element={<InterviewP/>}/>
      </Routes>
    </div>
  )
}

export default App
