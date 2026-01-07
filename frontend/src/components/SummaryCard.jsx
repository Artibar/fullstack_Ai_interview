import React from 'react'
import { getInitials } from "../utils/helper.js"
import { LuTrash2, LuClock, LuBookOpen, LuTrendingUp, LuTarget } from "react-icons/lu"

const SummaryCard = ({
    colors,
    role,
    topicsToFocus,
    experience,
    question,
    description,
    lastUpdated,
    onSelect,
    onDelete,
}) => {
    const formatText = (text) => {
        if (!text) return text;
        return text.toString().charAt(0).toUpperCase() + text.toString().slice(1).toLowerCase();
    };

    return (
        <div className='group bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/10 text-white transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm' onClick={onSelect}>
            {/* Header Section with Role and Avatar */}
            <div className='relative p-6 overflow-hidden' style={{ 
                background: `linear-gradient(135deg, ${colors.bgcolor}20, ${colors.bgcolor}40)`,
                borderBottom: `1px solid ${colors.bgcolor}30`
            }}>
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" 
                     style={{ background: colors.bgcolor, transform: 'translate(50%, -50%)' }}></div>
                
                <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-4'>
                        <div className='flex-shrink-0 w-14 h-14 bg-gray-900/50 border border-gray-800 text-white rounded-xl flex items-center justify-center shadow-lg'>
                            <span className='text-lg font-bold text-cyan-400'>
                                {getInitials(role)}
                            </span>
                        </div>
                        <div className='flex-grow'>
                            <h2 className='font-bold text-xl text-white mb-2 leading-tight'>
                                {formatText(role) || 'Untitled Role'}
                            </h2>
                            <div className='flex items-center gap-2 mb-3'>
                                <LuTarget className='text-orange-400 text-sm' />
                                <p className='text-sm text-gray-200 font-medium'>
                                    {topicsToFocus || 'No topics specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Delete Button - Fixed positioning and hover state */}
                    <button 
                        className='opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-2 text-xs text-red-400 font-medium bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/20 hover:border-red-500/40' 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete()
                        }}
                        title="Delete session"
                    >
                        <LuTrash2 className='text-sm' />
                        Delete
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className='px-6 pb-6'>
                {/* Stats Grid */}
                <div className='grid grid-cols-3 gap-3 mb-4'>
                    <div className='bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg px-3 py-2 text-center'>
                        <div className='flex items-center justify-center gap-1 mb-1'>
                            <LuTrendingUp className='text-cyan-400 text-xs' />
                            <span className='text-[10px] font-medium text-cyan-300 uppercase tracking-wide'>Experience</span>
                        </div>
                        <div className='text-sm font-bold text-white'>
                            {experience} {experience == 1 ? "year" : "years"}
                        </div>
                    </div>
                    
                    <div className='bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg px-3 py-2 text-center'>
                        <div className='flex items-center justify-center gap-1 mb-1'>
                            <LuBookOpen className='text-blue-400 text-xs' />
                            <span className='text-[10px] font-medium text-blue-300 uppercase tracking-wide'>Questions</span>
                        </div>
                        <div className='text-sm font-bold text-white'>
                            {question || 0} Q&A
                        </div>
                    </div>
                    
                    <div className='bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg px-3 py-2 text-center'>
                        <div className='flex items-center justify-center gap-1 mb-1'>
                            <LuClock className='text-purple-400 text-xs' />
                            <span className='text-[10px] font-medium text-purple-300 uppercase tracking-wide'>Updated</span>
                        </div>
                        <div className='text-xs font-bold text-white'>
                            {lastUpdated || 'Never'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className='bg-gray-800/30 border border-gray-700/50 rounded-lg p-4'>
                        <p className='text-sm text-gray-300 leading-relaxed line-clamp-2'>
                            {description}
                        </p>
                    </div>
                )}

                {/* Status Indicator */}
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50'>
                    <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                        <span className='text-xs text-green-400 font-medium'>Active Session</span>
                    </div>
                    <div className='flex items-center gap-1 text-gray-500 text-xs'>
                        <span>Click to view details</span>
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl'></div>
        </div>
    )
}

export default SummaryCard