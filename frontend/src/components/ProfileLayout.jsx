import { AuthContext } from "../context/authContextProvider"
import React from 'react'
import { useContext } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const ProfileLayout = ({children}) => {
  const {authUser} = useContext(AuthContext)
  return (
    <div className="full-h-screen flex flex-col bg-gradient-to-b from-[#0b1020] via-[#08080d] to-[#050507]">
      <Navbar />
      {authUser ? (
        <div className="bg-black flex-grow w-full h-full border-t border-gray-800/60">{children}</div>
      ) : (
        <div className="text-white text-center py-10">Loading or unauthorized...</div>
      )}
      <Footer />
    </div>
  );
}

export default ProfileLayout