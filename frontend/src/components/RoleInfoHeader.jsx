import React from 'react'
import { LuTrendingUp, LuBookOpen, LuCalendar } from 'react-icons/lu'

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  question,  
  description,
  lastUpdated
}) => {
  const formatText = (text) => {
    if (!text) return text;
    return text.toString().charAt(0).toUpperCase() + text.toString().slice(1).toLowerCase();
  };

  return (
    <div className="relative overflow-hidden bg-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 py-6">
        {/* Header Section - Following your original layout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex-1 z-10 relative">
            <div className="mb-3 flex justify-between gap-14">
              <h1 className="text-4xl md:text-5xl font-bold  mb-3 tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                {formatText(role) || 'Role Position'}
              </h1>
              
              {/* Stats cards - keeping your original 3-card layout */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-md rounded-xl px-4 py-3 border border-cyan-500/30 hover:scale-105 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <LuTrendingUp className="text-cyan-400 text-sm" />
                    <div className="text-xs text-cyan-300 tracking-wide font-medium">Experience</div>
                  </div>
                  <div className="text-medium text-white font-semibold">
                    {formatText(experience) || 'Not specified'}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl px-4 py-3 border border-blue-500/30 hover:scale-105 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <LuBookOpen className="text-blue-400 text-sm" />
                    <div className="text-xs text-blue-300 tracking-wide font-medium">Questions</div>
                  </div>
                  <div className="text-medium text-white font-semibold">
                    {question?.toString() || '0'}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-xl px-4 py-3 border border-purple-500/30 hover:scale-105 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <LuCalendar className="text-purple-400 text-sm" />
                    <div className="text-xs text-purple-300 tracking-wide font-medium">Last Updated</div>
                  </div>
                  <div className="text-medium text-white font-semibold">
                    {lastUpdated || 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Topics section - keeping your original placement and styling */}
        <div className="flex justify-items-start gap-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-lg text-gray-300 capitalize font-medium">
            {formatText(topicsToFocus) || 'No topics specified'}
          </p>
        </div>

        {/* Optional: Enhanced topics display if there are multiple topics */}
        {topicsToFocus && topicsToFocus.includes(',') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {topicsToFocus.split(',').map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium hover:from-orange-500/30 hover:to-amber-500/30 transition-all duration-200"
              >
                {topic.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleInfoHeader;