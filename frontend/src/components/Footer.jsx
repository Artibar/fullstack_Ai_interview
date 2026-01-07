
import React from 'react'
import {Link } from "react-router-dom"

const Footer = () => {
    return (
        <div className="h-20 bg-gradient-to-b from-[#0b1020] via-[#08080d] to-[#050507] text-white pt-0">
            <footer className="border-t border-gray-800/60 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-gray-400">© {new Date().getFullYear()} Ai InterView Prep. All rights reserved.</div>
                    <div className="flex gap-4 text-sm text-gray-300">
                        <Link to="privacy" className="hover:text-white">Privacy</Link>
                        <Link to="/terms"className="hover:text-white">Terms</Link>
                        <Link to="/contact" className="hover:text-white">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer