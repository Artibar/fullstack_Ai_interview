import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse, LuLoader, LuPin, LuPinOff, LuEye, LuRefreshCw, LuChevronDown, LuBookOpen, LuTarget, LuClock } from "react-icons/lu";
import { toast } from "react-hot-toast";
import ProfileLayout from "../components/ProfileLayout"
import RoleInfoHeader from "../components/RoleInfoHeader.jsx"
import axiosInstance from "../utils/axios.js"

const InterviewP = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false)
  const [error, setError] = useState("")
  const [loadingSession, setLoadingSession] = useState(true)
  
  // Answer generation states
  const [generatingAnswers, setGeneratingAnswers] = useState({});
  const [generatingAllAnswers, setGeneratingAllAnswers] = useState(false);

  const fetchSessionDetailsById = async () => {
    try {
      setLoadingSession(true)
      const response = await axiosInstance.get(`/session/${sessionId}`)
      
      if (response.data && response.data.success) {
        let sessionData = null;
        
        if (response.data.session) {
          sessionData = response.data.session;
        } else if (response.data.sessionId) {
          sessionData = response.data.sessionId;
        } else if (response.data.data) {
          sessionData = response.data.data;
        }
        
        if (sessionData) {
          setSessionData(sessionData);
          // Auto-select first question if none selected and questions exist
          if (!selectedQuestionId && sessionData.question && sessionData.question.length > 0) {
            setSelectedQuestionId(sessionData.question[0]._id);
          }
        } else {
          setError("Invalid response format from server");
        }
      } else {
        setError("Failed to fetch session data");
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setError("Failed to load session data")
    } finally {
      setLoadingSession(false)
    }
  }

  const generateQuestionAnswer = async (questionId, questionText) => {
    try {
      setGeneratingAnswers(prev => ({ ...prev, [questionId]: true }));
      
      const response = await axiosInstance.post(`/question/${questionId}/generate-answer`, {
        sessionId: sessionId
      });

      if (response.data && response.data.success) {
        toast.success("Answer generated successfully!");
        
        setSessionData(prevData => ({
          ...prevData,
          question: prevData.question.map(q => 
            q._id === questionId 
              ? { ...q, answer: JSON.stringify(response.data.data.answer), updatedAt: response.data.data.updatedAt }
              : q
          )
        }));
      } else {
        toast.error("Failed to generate answer");
      }
    } catch (error) {
      console.error("Error generating answer:", error);
      toast.error("Failed to generate answer");
    } finally {
      setGeneratingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const generateAllAnswers = async () => {
    if (!sessionData || !sessionData.question) return;
    
    const unansweredQuestions = sessionData.question.filter(q => !q.answer || q.answer === "");
    
    if (unansweredQuestions.length === 0) {
      toast.success("All questions already have answers!");
      return;
    }

    setGeneratingAllAnswers(true);
    
    try {
      let successCount = 0;
      
      for (const question of unansweredQuestions) {
        try {
          await generateQuestionAnswer(question._id, question.question);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to generate answer for question ${question._id}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Generated ${successCount} answers successfully!`);
      }
    } catch (error) {
      console.error("Error in generateAllAnswers:", error);
      toast.error("Failed to generate all answers");
    } finally {
      setGeneratingAllAnswers(false);
    }
  };

  const parseAnswer = (answerString) => {
    if (!answerString || answerString === "") return null;
    try {
      return JSON.parse(answerString);
    } catch {
      return { explanation: answerString };
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(`/question/${questionId}/pin`)
      if (response.data && response.data.success) {
        const updatedQuestion = response.data.data || response.data.Questions || response.data.question;
        toast.success(updatedQuestion.isPinned ? "Question pinned" : "Question unpinned")
        
        setSessionData(prevData => ({
          ...prevData,
          question: prevData.question.map(q => 
            q._id === questionId 
              ? { ...q, isPinned: updatedQuestion.isPinned }
              : q
          )
        }));
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update pin status")
    }
  };

  const addMoreQuestions = async () => {
    try {
      if (!sessionData || !sessionData.role || !sessionData.experience || !sessionData.topicsToFocus) {
        setError("Missing required session data. Please check your session configuration.");
        return;
      }

      setIsUpdateLoader(true);
      setError("")

      const aiResponse = await axiosInstance.post("/ai/generate-questions", {
        role: sessionData.role,
        experience: sessionData.experience,
        topicsToFocus: sessionData.topicsToFocus,
        questionCount: 5
      });

      if (aiResponse.data && aiResponse.data.ok) {
        const generatedQuestions = aiResponse.data.data;

        const response = await axiosInstance.post('/question/add', {
          sessionId: sessionId,
          question: generatedQuestions
        });

        if (response && response.data) {
          toast.success(`Added ${generatedQuestions.length} new questions!`)
          setTimeout(() => {
            fetchSessionDetailsById()
          }, 500);
        } else {
          setError("Failed to add questions. Please try again.")
        }
      } else {
        setError("Failed to generate questions. Please try again.")
      }

    } catch (error) {
      console.error("Error adding questions:", error);
      setError("Something went wrong. Please try again later")
    } finally {
      setIsUpdateLoader(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
  }, [sessionId])

  // Get selected question data
  const selectedQuestion = sessionData?.question?.find(q => q._id === selectedQuestionId);
  const selectedAnswer = parseAnswer(selectedQuestion?.answer);

  // Enhanced Loading Component
  const LoadingState = () => (
    <ProfileLayout>
      <div className="min-h-screen  bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            {/* Animated spinner with multiple layers */}
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-pulse mx-auto"></div>
              <div className="absolute inset-2 w-16 h-16 border-2 border-blue-400/30 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Loading Interview Session</h2>
            <p className="text-gray-400 mb-8">Preparing your questions and answers...</p>

            {/* Loading progress indicators */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 flex items-center gap-2">
                  <LuBookOpen className="w-4 h-4 text-cyan-400" />
                  Loading session data
                </span>
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>

            {/* Tips card */}
            <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <LuTarget className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white">Interview Tip</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Practice answering questions out loud to improve your confidence and delivery during the actual interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );

  if (loadingSession) {
    return <LoadingState />;
  }

  if (error && !sessionData) {
    return (
      <ProfileLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuCircleAlert className="text-red-400 text-2xl" />
                </div>
                <h2 className="text-red-300 text-xl font-semibold mb-3">Failed to Load Session</h2>
                <p className="text-gray-300 mb-6">{error}</p>
                <div className="space-y-3">
                  <button
                    onClick={fetchSessionDetailsById}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout className="bg-black">
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || ""}
        questionCount={(sessionData?.question || [])?.length || 0}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
      />

      <div className='container mx-auto px-4 py-6 bg-black min-h-screen'>
        {/* Header with controls */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-1'>Interview Q & A</h2>
            <p className="text-gray-400 text-sm">Practice and prepare your responses</p>
          </div>
          <div className="flex items-center gap-4">
            {sessionData?.question?.length > 0 && (
              <>
                <button
                  onClick={generateAllAnswers}
                  disabled={generatingAllAnswers || Object.values(generatingAnswers).some(Boolean)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-all shadow-lg hover:shadow-green-500/25"
                >
                  {generatingAllAnswers ? (
                    <>
                      <LuLoader className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <LuListCollapse />
                      Generate All Answers
                    </>
                  )}
                </button>
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  <span className='text-sm text-gray-300'>
                    <span className="text-green-400 font-semibold">
                      {sessionData.question.filter(q => q.answer && q.answer !== "").length}
                    </span>
                    {' / '}
                    <span className="text-gray-400">
                      {sessionData.question.length}
                    </span>
                    <span className="text-gray-500 ml-1">answered</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className='bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4 mb-6'>
            <p className='text-red-300'>{error}</p>
          </div>
        )}

        {/* Main Content - Improved Responsive Layout */}
        {sessionData?.question?.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Panel - Questions List */}
            <div className="xl:col-span-5 space-y-4">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <LuBookOpen className="w-5 h-5 text-cyan-400" />
                    Questions ({sessionData.question.length})
                  </h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {sessionData.question.map((question, index) => {
                      const hasAnswer = question.answer && question.answer !== "";
                      const isSelected = selectedQuestionId === question._id;
                      const isGenerating = generatingAnswers[question._id];
                      
                      return (
                        <motion.div
                          key={question._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 border-b border-gray-800/50 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-l-4 border-l-cyan-400' 
                              : 'hover:bg-gray-800/50'
                          }`}
                          onClick={() => setSelectedQuestionId(question._id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-cyan-400 font-semibold bg-cyan-400/20 px-2 py-0.5 rounded">
                                  Q{index + 1}
                                </span>
                                {question.isPinned && (
                                  <LuPin className="text-yellow-400 text-sm" />
                                )}
                                <div className={`w-2 h-2 rounded-full ${
                                  hasAnswer ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-600'
                                }`} title={hasAnswer ? 'Answered' : 'Not answered'} />
                              </div>
                              <p className="text-sm text-gray-200 leading-relaxed mb-2 line-clamp-3">
                                {question.question}
                              </p>
                              {hasAnswer && (
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                                  {parseAnswer(question.answer)?.explanation?.substring(0, 100)}...
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {isGenerating && (
                                <LuLoader className="animate-spin text-blue-400 text-sm" />
                              )}
                              {!hasAnswer && !isGenerating && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    generateQuestionAnswer(question._id, question.question);
                                  }}
                                  className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-1.5 rounded-md transition-all"
                                >
                                  Generate
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Add More Questions Button */}
              <button
                onClick={addMoreQuestions}
                disabled={isUpdateLoader}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-xl disabled:opacity-50 w-full font-medium transition-all"
              >
                {isUpdateLoader ? (
                  <>
                    <LuLoader className="animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <LuListCollapse />
                    Add More Questions
                  </>
                )}
              </button>
            </div>

            {/* Right Panel - Selected Question Details with Dynamic Height */}
            <div className="xl:col-span-7">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                {selectedQuestion ? (
                  <>
                    {/* Question Header */}
                    <div className="p-6 border-b border-gray-700/50 bg-gray-800/50 sticky top-0 z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm text-cyan-400 font-semibold bg-cyan-400/20 px-3 py-1 rounded-full">
                              Question {sessionData.question.findIndex(q => q._id === selectedQuestionId) + 1}
                            </span>
                            {selectedQuestion.isPinned && (
                              <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                                <LuPin className="w-3 h-3" />
                                Pinned
                              </div>
                            )}
                          </div>
                          <p className="text-gray-100 leading-relaxed text-lg">
                            {selectedQuestion.question}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleQuestionPinStatus(selectedQuestion._id)}
                            className={`p-3 rounded-lg transition-all ${
                              selectedQuestion.isPinned 
                                ? "text-yellow-300 hover:text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30" 
                                : "text-gray-400 hover:text-yellow-300 bg-gray-700/50 hover:bg-yellow-500/20"
                            }`}
                          >
                            {selectedQuestion.isPinned ? <LuPin /> : <LuPinOff />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Answer Content - DYNAMIC HEIGHT with proper scrolling */}
                    <div className="max-h-[800px] overflow-y-auto">
                      <div className="p-6">
                        {selectedAnswer ? (
                          <div className="space-y-6">
                            {/* Actions */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                              <button
                                onClick={() => generateQuestionAnswer(selectedQuestion._id, selectedQuestion.question)}
                                disabled={generatingAnswers[selectedQuestion._id]}
                                className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-800 disabled:to-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                              >
                                {generatingAnswers[selectedQuestion._id] ? (
                                  <>
                                    <LuLoader className="animate-spin" />
                                    Regenerating...
                                  </>
                                ) : (
                                  <>
                                    <LuRefreshCw />
                                    Regenerate Answer
                                  </>
                                )}
                              </button>
                              <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                                Updated: {new Date(selectedQuestion.updatedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Enhanced Content Sections with Auto-expanding height */}
                            <div className="space-y-6">
                              {/* Explanation Section - Always expanded and auto-height */}
                              <ExpandingContentCard 
                                title="Detailed Explanation" 
                                icon={<LuEye className="text-sm" />}
                                defaultExpanded={true}
                                accentColor="green"
                              >
                                <div className="prose prose-invert max-w-none">
                                  <div className="text-gray-100 leading-relaxed whitespace-pre-wrap text-base">
                                    {selectedAnswer.explanation}
                                  </div>
                                </div>
                              </ExpandingContentCard>

                              {/* Key Points */}
                              {selectedAnswer.keyPoints && selectedAnswer.keyPoints.length > 0 && (
                                <ExpandingContentCard 
                                  title={`Key Points (${selectedAnswer.keyPoints.length})`}
                                  defaultExpanded={false}
                                  accentColor="blue"
                                >
                                  <ul className="space-y-4">
                                    {selectedAnswer.keyPoints.map((point, idx) => (
                                      <li key={idx} className="flex items-start gap-4">
                                        <span className="w-7 h-7 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5 flex-shrink-0">
                                          {idx + 1}
                                        </span>
                                        <span className="text-gray-100 leading-relaxed flex-1">{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </ExpandingContentCard>
                              )}

                              {/* Examples */}
                              {selectedAnswer.examples && selectedAnswer.examples.length > 0 && (
                                <ExpandingContentCard 
                                  title={`Examples (${selectedAnswer.examples.length})`}
                                  defaultExpanded={false}
                                  accentColor="purple"
                                >
                                  <ul className="space-y-4">
                                    {selectedAnswer.examples.map((example, idx) => (
                                      <li key={idx} className="border-l-4 border-purple-400/40 pl-6 py-2">
                                        <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">{example}</div>
                                      </li>
                                    ))}
                                  </ul>
                                </ExpandingContentCard>
                              )}

                              {/* Best Practices */}
                              {selectedAnswer.bestPractices && selectedAnswer.bestPractices.length > 0 && (
                                <ExpandingContentCard 
                                  title={`Best Practices (${selectedAnswer.bestPractices.length})`}
                                  defaultExpanded={false}
                                  accentColor="orange"
                                >
                                  <ul className="space-y-4">
                                    {selectedAnswer.bestPractices.map((practice, idx) => (
                                      <li key={idx} className="flex items-start gap-4">
                                        <span className="text-orange-300 mt-1 text-lg">⭐</span>
                                        <span className="text-gray-100 leading-relaxed flex-1">{practice}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </ExpandingContentCard>
                              )}
                            </div>
                          </div>
                        ) : generatingAnswers[selectedQuestion._id] ? (
                          <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                              <div className="relative mb-6">
                                <div className="w-16 h-16 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-pulse mx-auto"></div>
                              </div>
                              <h3 className="text-lg font-medium text-white mb-2">Generating Answer</h3>
                              <p className="text-gray-400">AI is crafting a detailed response...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-16">
                            <div className="text-center max-w-md">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <LuCircleAlert className="text-gray-400 text-3xl" />
                              </div>
                              <h3 className="text-xl font-semibold text-white mb-3">No Answer Generated</h3>
                              <p className="text-gray-400 mb-6 leading-relaxed">
                                Generate an AI-powered answer to help you prepare for this interview question.
                              </p>
                              <button
                                onClick={() => generateQuestionAnswer(selectedQuestion._id, selectedQuestion.question)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-all shadow-lg hover:shadow-blue-500/25"
                              >
                                <LuListCollapse />
                                Generate Answer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <LuEye className="text-gray-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">Select a Question</h3>
                      <p className="text-gray-400 leading-relaxed">
                        Choose a question from the left panel to view its details and generate answers.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-16'>
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                <LuBookOpen className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Questions Available</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Get started by generating your first set of interview questions.
              </p>
              {sessionData && sessionData.role && sessionData.experience && sessionData.topicsToFocus ? (
                <button
                  onClick={addMoreQuestions}
                  disabled={isUpdateLoader}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-lg disabled:opacity-50 flex items-center mx-auto gap-2 font-medium transition-all shadow-lg hover:shadow-cyan-500/25"
                >
                  {isUpdateLoader ? (
                    <>
                      <LuLoader className="animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <LuListCollapse />
                      Generate Questions
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-6 max-w-md mx-auto">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LuCircleAlert className="text-amber-400 text-xl" />
                  </div>
                  <h4 className="text-amber-300 font-semibold mb-2">Incomplete Session Data</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This session is missing required information. Please check your session settings and ensure all fields are completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  )
}

// Enhanced Expanding Content Card Component - Auto-height with smooth animations
const ExpandingContentCard = ({ title, children, icon, defaultExpanded = false, accentColor = "gray" }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const colorClasses = {
    green: "text-green-400 border-green-500/20 bg-gradient-to-br from-green-600/5 to-emerald-600/10",
    blue: "text-blue-400 border-blue-500/20 bg-gradient-to-br from-blue-600/5 to-cyan-600/10", 
    purple: "text-purple-400 border-purple-500/20 bg-gradient-to-br from-purple-600/5 to-pink-600/10",
    orange: "text-orange-400 border-orange-500/20 bg-gradient-to-br from-orange-600/5 to-yellow-600/10",
    gray: "text-gray-400 border-gray-500/20 bg-gradient-to-br from-gray-600/5 to-gray-700/10"
  };

  return (
    <div className={`border rounded-xl overflow-hidden border-${accentColor}-500/20 ${colorClasses[accentColor]} backdrop-blur-sm`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 text-left flex items-center justify-between transition-all duration-200 hover:bg-black/10 ${colorClasses[accentColor].split(' ')[0]} font-semibold`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${accentColor}-500/20`}>
            {icon}
          </div>
          <span className="text-white">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <LuChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-gray-700/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewP