import React, { useState } from 'react'
import { LuBriefcase, LuTrendingUp, LuTarget, LuFileText, LuLoader, LuX, LuPlus } from 'react-icons/lu'
import axiosInstance from '../utils/axios'

const CreateSessionForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    role: '',
    experience: '',
    topicsToFocus: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create session
      console.log("🚀 Creating session with data:", formData);
      const sessionResponse = await axiosInstance.post('/session/create', formData)
      
      if (sessionResponse.data.success) {
        const sessionId = sessionResponse.data.session._id
        console.log("✅ Session created:", sessionId);

        // 2. Generate questions for the session
        console.log("🤖 Generating questions...");
        const questionsResponse = await axiosInstance.post('/ai/generate-questions', {
          ...formData,
          sessionId: sessionId,  // This is crucial!
          question: 10 // number of questions
        })

        if (questionsResponse.data.ok) {
          console.log("✅ Questions generated and saved!");
          
          // Call success callback with the complete session data
          if (onSuccess) {
            onSuccess(sessionResponse.data.session)
          }
        } else {
          console.error("❌ Failed to generate questions:", questionsResponse.data);
          // Still call success since session was created
          if (onSuccess) {
            onSuccess(sessionResponse.data.session)
          }
        }
      }
    } catch (error) {
      console.error("❌ Error creating session:", error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-cyan-600/10 to-blue-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <LuPlus className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Session</h2>
                <p className="text-gray-400 text-sm">Set up your interview preparation session</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors"
              disabled={loading}
            >
              <LuX className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <LuBriefcase className="text-cyan-400" />
              Role Position
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Experience Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <LuTrendingUp className="text-blue-400" />
              Experience Level
            </label>
            <div className="relative">
              <select
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" className="bg-gray-800">Select your experience level</option>
                <option value="0-1 year" className="bg-gray-800">0-1 year</option>
                <option value="1-3 years" className="bg-gray-800">1-3 years</option>
                <option value="3-5 years" className="bg-gray-800">3-5 years</option>
                <option value="5+ years" className="bg-gray-800">5+ years</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Topics Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <LuTarget className="text-purple-400" />
              Topics to Focus
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.topicsToFocus}
                onChange={(e) => setFormData({...formData, topicsToFocus: e.target.value})}
                placeholder="e.g., react node javascript, machine learning, system design"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Separate multiple topics with commas</p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <LuFileText className="text-orange-400" />
              Description (Optional)
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add any specific details about your interview preparation goals..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-700/50">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LuLoader className="animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <LuPlus className="text-sm" />
                  Create Session
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center max-w-sm mx-4">
              <div className="w-16 h-16 border-4 border-gray-600 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-white font-semibold mb-2">Creating Your Session</h3>
              <p className="text-gray-400 text-sm">Generating questions and setting up your interview prep...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateSessionForm