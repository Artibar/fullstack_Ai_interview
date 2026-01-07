
import React, { useContext } from 'react'
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import axiosInstance from "../utils/axios.js"
import {AuthContext} from "../context/authContextProvider.jsx"

const Signup = () => {

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const {updateUser} = useContext(AuthContext)

  const navigate = useNavigate()
  const onChange = (key, value) => {
    setForm((prevData) => ({
      ...prevData,
      [key]: value
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { username, email, password } = form
    if (!username || !email || !password) {
      setError("All details required")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("http://localhost:3000/auth/signup", {...form})
      const {token } = response.data
      if (token) {
        localStorage.setItem("token", token)
        updateUser(response.data)
        navigate('/login')
      }
    } catch (error) {
      if (error.response && error.response?.data?.message) {
        setError(error.response.data.message)
        console.error("Signup error:", error.response.data.message);
        
      } else {
        setError("Something went wrong")
        console.error("Signup error:", error);
        
      }
    } finally {
      setIsLoading(false)
    }


  }
  return (
    // <div className="flex justify-center w-full h-full-cover   text-white mb-10px">

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1020] via-[#08080d] to-[#050507] px-4">
      <div className="w-full max-w-md bg-gray-900/50 border-gray-800 rounded-2xl shadow-xl p-8 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mb-2">Ai InterView Preparation</h1>
        <p className="text-gray-300 mb-6">Welcome! Signup to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className=" text-gray-200 block mb-1">Name</label>
            <input
              type="username"
              value={form.username}
              onChange={(e)=>onChange("username", e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 text-cyan-400 rounded-lg bg-transparent border border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400  placeholder-cyan-200"
            />
          </div>

          <div className="block">
            <label className=" text-gray-200 block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e)=>onChange("email", e.target.value)}
              placeholder="Enter your Email"
              className="w-full px-3 py-2 rounded-lg text-cyan-400 bg-transparent border border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400  placeholder-cyan-200"
            />
          </div>

          <div className="block">
            <label className=" text-gray-200 block mb-1">Password</label>
            <input
              type="text"
              name='password'
              value={form.password}
              onChange={(e)=>onChange("password", e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-300">
              <input name="remember" type="checkbox" checked={form.remember} onChange={(e)=>onChange("remember", e.target.value)} className="w-4 h-4" />
              <span className="text-sm">remember me</span>
            </label>
            <Link to="/forgot" className="text-cyan-300 text-sm">Forget Password</Link>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-b from-cyan-400/90 to-cyan-600 text-black font-semibold text-lg shadow-md hover:scale-[1.01] transition"
          disabled={isLoading}>
            {isLoading? ("Loading..."): ("signup")}
            
          </button>
        </form>

        <p className="mt-6 text-gray-300 text-center">Already have an account? <Link to="/login" className="text-cyan-300">login</Link></p>
      </div>
    </div>

    // </div>
  )
}

export default Signup