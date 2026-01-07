import React, { useEffect, useState } from 'react'
import ProfileLayout from "../components/ProfileLayout"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axios.js"
import moment from "moment"
import SummaryCard from "../components/SummaryCard"
import CreateSessionForm from '../components/CreateSessionForm.jsx'
import DeleteAlertContent from '../components/DeleteAlertContent.jsx'
import Modal from "../components/Modal.jsx"
import { LuPlus, LuBookOpen, LuTarget, LuClock } from "react-icons/lu"

const Profile = () => {
  const navigate = useNavigate()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [session, setSession] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  })

  const fetchAllSession = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get('/session/my-session')
      console.log("📊 Fetched sessions:", response.data);
      setSession(response.data)
    } catch (error) {
      console.error("Error in fetching Session data:", error);
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionData) => {
    try {
      const response = await axiosInstance.delete(`/session/${sessionData?._id}`);
      setOpenDeleteAlert({
        open: false,
        data: null,
      })
      fetchAllSession()
    } catch (error) {
      console.error("error in deleting session:", error);
    }
  }

  const handleSessionCreated = async (newSession) => {
    console.log("✅ Session created successfully:", newSession);
    setOpenCreateModal(false);
    await fetchAllSession();
  }

  const handleCloseModal = () => {
    setOpenCreateModal(false);
  }

  useEffect(() => {
    fetchAllSession()
  }, [])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-800/50 rounded-2xl p-6 h-48">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="flex space-x-4 mb-4">
          <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  )

  // Empty state component
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full p-6 mb-6">
        <LuBookOpen className="w-12 h-12 text-cyan-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Interview Sessions Yet</h3>
      <p className="text-gray-400 text-center mb-8 max-w-md">
        Get started by creating your first interview preparation session. Practice makes perfect!
      </p>
      <button 
        className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25"
        onClick={() => setOpenCreateModal(true)}
      >
        <LuPlus className="w-5 h-5" />
        Create Your First Session
      </button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Animated spinner */}
        <div className="w-16 h-16 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        {/* Pulsing background circle */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Loading Your Sessions</h3>
      <p className="text-gray-400 text-center">Preparing your interview preparation dashboard...</p>
      
      {/* Loading tips */}
      <div className="mt-8 bg-gray-800/30 rounded-lg p-4 max-w-md">
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <LuTarget className="w-4 h-4" />
          <span className="text-sm font-medium">Pro Tip</span>
        </div> 
        <p className="text-gray-300 text-sm">
          Regular practice sessions help improve your interview confidence and performance.
        </p>
      </div>
    </div>
  )

  return (
    <ProfileLayout className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Interview Preparation Dashboard</h1>
          <p className="text-gray-400">Manage and track your interview preparation sessions</p>
        </div>

        {/* Stats Cards - Optional enhancement */}
        {!loading && session?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 rounded-lg p-2">
                  <LuBookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{session.length}</p>
                  <p className="text-sm text-gray-400">Total Sessions</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 rounded-lg p-2">
                  <LuTarget className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {session.reduce((total, s) => total + (s?.question?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-400">Questions Prepared</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 rounded-lg p-2">
                  <LuClock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {session.length > 0 ? moment(session[0]?.updatedAt).format("MMM DD") : "--"}
                  </p>
                  <p className="text-sm text-gray-400">Last Activity</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {loading ? (
              // Enhanced loading state
              <>
                <LoadingState />
              </>
            ) : session?.length > 0 ? (
              // Sessions list with improved spacing
              session.map((data, index) => (
                <SummaryCard
                  key={data?._id}
                  colors={index}
                  role={data?.role || ""}
                  topicsTofocus={data?.topicsToFocus || ""}
                  experience={data?.experience || "-"}
                  question={data?.question?.length || 0}
                  description={data?.description || "-"}
                  lastUpdated={
                    data?.updatedAt
                      ? moment(data.updatedAt).format("Do MMM YYYY")
                      : ""
                  }
                  onSelect={() => navigate(`/interviewp/${data?._id}`)}
                  onDelete={() => setOpenDeleteAlert({ open: true, data })}
                />
              ))
            ) : (
              // Enhanced empty state
              <EmptyState />
            )}
          </div>
        </div>

        {/* Floating Action Button - Only show if not in empty state */}
        {(!loading && session?.length > 0) && (
          <button 
            className='fixed bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 md:h-16 md:w-16 flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 z-50'
            onClick={() => setOpenCreateModal(true)}
            title="Add new session"
          >
            <LuPlus className="text-2xl" />
          </button>
        )}
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={openCreateModal}
        onClose={handleCloseModal}
        hideHeader
      >
        <div>
          <CreateSessionForm 
            onSuccess={handleSessionCreated}
            onCancel={handleCloseModal}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteAlert.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Alert"
      >
        <div className='w-[30vw]'>
          <DeleteAlertContent
            content="Are you sure you wanna delete this session data"
            onDelete={() => deleteSession(openDeleteAlert.data)} 
          />
        </div>
      </Modal>
    </ProfileLayout>
  )
}

export default Profile