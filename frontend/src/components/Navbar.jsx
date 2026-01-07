
import React from 'react'
import { Link } from "react-router-dom"
import {AuthContext} from "../context/authContextProvider"
import { useContext } from 'react'
import {useState } from "react"


const Navbar = () => {
    const {authUser} = useContext(AuthContext)
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="h-20  bg-gradient-to-b from-[#0b1020] via-[#08080d] to-[#050507] text-white pt-0 mb-0">
            {/* NAV */}
            <header className="max-w-7xl mx-auto  px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-bold">IP</div>
                    <div>
                        <h1 className="text-sm font-semibold">Ai InterView Preparation</h1>
                        <p className="text-xs text-gray-400">Ace Interviews with AI-Powered Learning</p>
                    </div>
                </div>


                <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
                    <Link to="/" className={isOpen? "text-blue-400":"text-white" }>Home</Link>
                    <Link to="/profile" className={isOpen? "text-blue-400":"text-white"}>Profile</Link>
                    <Link   to="/interviewp" className={isOpen? "text-blue-400": "text-white"}>InterView Preparation</Link>
                    {!authUser &&<button className="ml-2 px-4 py-2 rounded-lg bg-white text-black font-semibold">
                        <Link to="/login">Login</Link>
                    </button>}
                    {authUser && <button className="ml-2 px-4 py-2 rounded-lg bg-white text-black font-semibold">
                        <Link to="/login">Logout</Link>
                    </button>}
                </nav>


                <div className="md:hidden">
                    <button className="p-2 rounded-md bg-gray-800/60"
                    onClick={() => setIsOpen(prev => !prev)}>Menu</button>
                </div>
            </header>
        </div>
    )
}

export default Navbar