
import { useState } from 'react'
import {
  askBusinessQuestion,
} from '../services/assistantService'
import {
  Bot,
  Sparkles,
  Send,
  User,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  RotateCcw,
  LoaderCircle,
  ArrowUpRight,
} from 'lucide-react'

const suggestions = [
  {
    icon: TrendingUp,
    title: 'Business Performance',
    question: 'How is my business performing?',
    description: 'Get an overview of your business.',
  },
  {
    icon: Sparkles,
    title: 'Best-Selling Products',
    question: 'Which product is selling the most?',
    description: 'Discover your top-performing products.',
  },
  {
    icon: MessageSquare,
    title: 'Customer Feedback',
    question: 'What are customers saying about my business?',
    description: 'Understand customer satisfaction.',
  },
  {
    icon: Lightbulb,
    title: 'Business Recommendations',
    question: 'How can I improve my business?',
    description: 'Get practical business suggestions.',
  },
]

function Assistant() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSend = async (e, customQuestion) => {
    e?.preventDefault()

    if (loading) return

    const userQuestion = (customQuestion || question).trim()

    if (!userQuestion) return

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        content: userQuestion,
      },
    ])

    setQuestion('')
    setLoading(true)

    try {
      const response = await askBusinessQuestion(userQuestion)

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: response.result.answer,
          keyPoints: response.result.keyPoints,
          recommendations: response.result.recommendations,
        },
      ])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: 'error',
          content: error.message,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearConversation = () => {
    if (loading) return
    setMessages([])
    setQuestion('')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Sparkles size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                AI Business Assistant
              </h1>
              <p className="text-sm text-slate-500">
                Your intelligent business companion
              </p>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearConversation}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw size={15} />
            Clear conversation
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot size={22} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                BizPulse AI
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Business assistant
              </p>
            </div>
          </div>

          <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            AI Powered
          </div>
        </div>

        {/* Chat Messages */}
        <div className="min-h-[450px] max-h-[650px] space-y-6 overflow-y-auto p-5 sm:p-7">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center py-8 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
                <Sparkles size={30} />
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                How can I help your business today?
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Ask me anything about your sales, inventory, customer
                feedback, or business performance. I'll help you
                understand your data and make smarter decisions.
              </p>

              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((item) => {
                  const Icon = item.icon

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleSend(null, item.question)}
                      className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                          <Icon size={19} />
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="text-slate-300 transition group-hover:text-indigo-600"
                        />
                      </div>

                      <h3 className="mt-3 text-sm font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Conversation */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.role === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={18} />
                ) : (
                  <Bot size={19} />
                )}
              </div>

              <div
                className={`min-w-0 max-w-[88%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}
              >
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  {message.role === 'user'
                    ? 'You'
                    : message.role === 'error'
                      ? 'Error'
                      : 'BizPulse AI'}
                </p>

                <div
                  className={`rounded-2xl p-4 text-left ${
                    message.role === 'user'
                      ? 'rounded-tr-sm bg-indigo-600 text-white'
                      : message.role === 'error'
                        ? 'rounded-tl-sm bg-red-50 text-red-700'
                        : 'rounded-tl-sm border border-slate-100 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-7">
                    {message.content}
                  </p>

                  {/* Key Insights */}
                  {message.keyPoints?.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center gap-2">
                        <TrendingUp size={17} className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-800">
                          Key Business Insights
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {message.keyPoints.map((point, i) => (
                          <div
                            key={i}
                            className="flex gap-2 rounded-lg border border-slate-100 bg-white p-3"
                          >
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                            <p className="text-sm leading-6 text-slate-600">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {message.recommendations?.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Lightbulb size={17} className="text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-800">
                          Recommendations
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {message.recommendations.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                              {i + 1}
                            </span>

                            <p className="text-sm leading-6 text-slate-700">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Bot size={19} />
              </div>

              <div className="rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <LoaderCircle
                    size={16}
                    className="animate-spin text-indigo-600"
                  />
                  <span className="text-sm text-slate-500">
                    BizPulse AI is analysing your business...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about your business..."
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-slate-400">
            BizPulse AI uses your business data to generate insights and recommendations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Assistant
