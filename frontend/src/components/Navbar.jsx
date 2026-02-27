import React from 'react'
import { Link } from "react-router-dom"
import { AuthContext } from "../context/authContextProvider"
import { useContext, useState } from 'react'

const Navbar = () => {
    const { authUser } = useContext(AuthContext)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="bg-gradient-to-b from-[#0b1020] via-[#08080d] to-[#050507] text-white">
            {/* DESKTOP NAV */}
            <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-bold">IP</div>
                    <div>
                        <h1 className="text-sm font-semibold">Ai InterView Preparation</h1>
                        <p className="text-xs text-gray-400">Ace Interviews with AI-Powered Learning</p>
                    </div>
                </div>

                {/* Desktop links */}
                <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
                    <Link to="/" className="hover:text-white">Home</Link>
                    <Link to="/profile" className="hover:text-white">Profile</Link>
                    <Link to="/interviewp" className="hover:text-white">Interview Preparation</Link>
                    {!authUser && (
                        <Link to="/login">
                            <button className="ml-2 px-4 py-2 rounded-lg bg-white text-black font-semibold">Login</button>
                        </Link>
                    )}
                    {authUser && (
                        <Link to="/logout">
                            <button className="ml-2 px-4 py-2 rounded-lg bg-white text-black font-semibold">Logout</button>
                        </Link>
                    )}
                </nav>

                {/* Hamburger button - mobile only */}
                <div className="md:hidden">
                    <button
                        type="button"
                        className="p-2 rounded-md bg-gray-800/60"
                        onClick={() => setIsOpen(prev => !prev)}
                    >
                        {isOpen ? "Close" : "Menu"}
                    </button>
                </div>
            </header>

            {/* MOBILE MENU — renders below header when isOpen is true */}
            {isOpen && (
                <nav className="md:hidden flex flex-col gap-4 px-6 pb-6 text-sm text-gray-300">
                    <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                    <Link to="/interviewp" onClick={() => setIsOpen(false)}>Interview Preparation</Link>
                    {!authUser && (
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                            <button className="px-4 py-2 rounded-lg bg-white text-black font-semibold w-full">Login</button>
                        </Link>
                    )}
                    {authUser && (
                        <Link to="/logout" onClick={() => setIsOpen(false)}>
                            <button className="px-4 py-2 rounded-lg bg-white text-black font-semibold w-full">Logout</button>
                        </Link>
                    )}
                </nav>
            )}
        </div>
    )
}

export default Navbar