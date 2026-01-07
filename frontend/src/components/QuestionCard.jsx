// STEP 1: Replace your entire QuestionCard component with this
import React, { useState, useRef, useEffect } from 'react'
import { LuChevronDown, LuPin, LuPinOff, LuSparkles } from 'react-icons/lu'
import AIResponsePreview from "./AIResponsePreview"

const QuestionCard = ({
    question,
    answer,
    onLearnMore,
    isPinned,
    onTogglePin,
    role,
    stats, // Add this new prop
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isExpanded) {
            const contentHeight = contentRef.current?.scrollHeight || 0;
            setHeight(contentHeight + 16)
        } else {
            setHeight(0);
        }
    }, [isExpanded])

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    }

    // Get first two letters for role display
    const getRoleDisplay = (roleStr) => {
        if (!roleStr) return 'QU';
        return roleStr.substring(0, 2).toUpperCase();
    }

    return (
        // MAIN CONTAINER - Much more appealing dark design
        <div className='group relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-2xl mb-6 overflow-hidden shadow-2xl border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl'>
            
            {/* GLOW EFFECT */}
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            
            <div className='relative p-6'>
                <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-5 flex-1'>
                        
                        {/* ENHANCED ROLE BADGE */}
                        <div className='flex-shrink-0 relative'>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/10 transition-all duration-300 group-hover:scale-105'>
                                <span className='text-sm font-bold text-white tracking-wide'>
                                    {getRoleDisplay(role)}
                                </span>
                            </div>
                        </div>
                        
                        {/* CONTENT SECTION */}
                        <div className='flex-1 min-w-0 space-y-3'>
                            {/* ROLE TITLE */}
                            <div className='flex items-center gap-3'>
                                <h2 className='text-lg font-semibold text-white capitalize'>
                                    {role || 'Unknown'}
                                </h2>
                                <div className='h-2 w-2 rounded-full bg-cyan-400 animate-pulse'></div>
                            </div>
                            
                            {/* QUESTION */}
                            <h3 
                                className='text-sm md:text-base font-medium text-gray-200 leading-relaxed cursor-pointer hover:text-white transition-colors duration-200' 
                                onClick={toggleExpand}
                            >
                                {question}
                            </h3>
                            
                            {/* STATS ROW (like your image) */}
                            {stats && (
                                <div className='flex items-center gap-4 text-xs text-gray-400 mt-3 flex-wrap'>
                                    {stats.experience && (
                                        <div className='bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50'>
                                            <span className='text-gray-300'>Experience: </span>
                                            <span className='text-cyan-400 font-medium'>{stats.experience}</span>
                                        </div>
                                    )}
                                    {stats.qaCount && (
                                        <div className='bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50'>
                                            <span className='text-purple-400 font-medium'>{stats.qaCount} Q&A</span>
                                        </div>
                                    )}
                                    {stats.lastUpdated && (
                                        <div className='bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50'>
                                            <span className='text-gray-300'>Last Updated: </span>
                                            <span className='text-green-400 font-medium'>{stats.lastUpdated}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* ACTION CONTROLS */}
                    <div className='flex items-center gap-3 ml-4'>
                        {/* ACTION BUTTONS */}
                        <div className={`flex items-center gap-2 transition-all duration-300 ${
                            isExpanded 
                                ? "opacity-100" 
                                : "opacity-0 group-hover:opacity-100"
                        }`}>
                            {/* PIN BUTTON */}
                            <button 
                                className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-200'
                                onClick={onTogglePin}
                            >
                                {isPinned ? <LuPinOff className='w-3.5 h-3.5' /> : <LuPin className='w-3.5 h-3.5' />}
                            </button>
                            
                            {/* LEARN MORE BUTTON */}
                            <button 
                                className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-200'
                                onClick={() => {
                                    setIsExpanded(true);
                                    onLearnMore();
                                }}
                            >
                                <LuSparkles className='w-3.5 h-3.5' />
                                <span className='hidden md:inline'>Learn</span>
                            </button>
                        </div>
                        
                        {/* EXPAND BUTTON */}
                        <button 
                            className='p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-slate-800/60 transition-all duration-200 border border-slate-700/30'
                            onClick={toggleExpand}
                        >
                            <LuChevronDown 
                                size={18}
                                className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            />
                        </button>
                    </div>
                </div>
                
                {/* ANSWER CONTENT */}
                <div 
                    className='overflow-hidden transition-all duration-500 ease-out'
                    style={{ maxHeight: `${height}px` }}
                >
                    <div ref={contentRef} className='mt-6'>
                        <div className='bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-inner border border-gray-200/50'>
                            <AIResponsePreview content={answer} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
