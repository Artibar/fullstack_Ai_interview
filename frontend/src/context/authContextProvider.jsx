import React, { createContext, useState, useEffect } from "react"
import axiosInstance from "../utils/axios.js"

export const AuthContext = createContext()
const baseURL = import.meta.env.MODE ==="development"? "http://localhost:3000": ""
const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (authUser) return
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`${baseURL}/auth/profile`);
        setAuthUser(response.data);
      } catch (error) {
        console.error("User not authenticated", error);
        clearUser()
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])
  const updateUser = async (userData) => {
    setAuthUser(userData)
    localStorage.setItem("token", userData.token);
    setLoading(false)
  }
  const clearUser = () => {
    setAuthUser(null)
    localStorage.removeItem("token")
  }
  return (
    <AuthContext.Provider value={{ authUser, loading, updateUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}
export default AuthProvider;