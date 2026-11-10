
import { useEffect, useState } from 'react'

import {
  MessageSquare,
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  X,
  Users,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Brain,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from 'lucide-react'

import {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  analyseFeedback,
} from '../services/feedbackService'

function Feedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analysingId, setAnalysingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    message: '',
    rating: 5,
  })

  // Fetch feedback
  const loadFeedback = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)

      setError('')

      const data = await getFeedback()
      setFeedback(data.feedback || [])
    } catch (err) {
      setError(err.message || 'Unable to load customer feedback.')
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [])

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Open form for adding feedback
  const openAddForm = () => {
    setEditingId(null)

    setFormData({
      customerName: '',
      email: '',
      message: '',
      rating: 5,
    })

    setError('')
    setSuccess('')
    setShowForm(true)
  }

  // Open form for editing feedback
  const openEditForm = (item) => {
    setEditingId(item._id)

    setFormData({
      customerName: item.customerName || '',
      email: item.email || '',
      message: item.message || '',
      rating: item.rating || 5,
    })

    setError('')
    setSuccess('')
    setShowForm(true)
  }

  // Save feedback
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        ...formData,
        rating: Number(formData.rating),
      }

      if (editingId) {
        await updateFeedback(editingId, payload)
        setSuccess('Feedback updated successfully.')
      } else {
        await createFeedback(payload)
        setSuccess('Customer feedback added successfully.')
      }

      setShowForm(false)
      setEditingId(null)

      setFormData({
        customerName: '',
        email: '',
        message: '',
        rating: 5,
      })

      await loadFeedback(false)
    } catch (err) {
      setError(err.message || 'Unable to save feedback.')
    } finally {
      setSaving(false)
    }
  }

  // Delete feedback
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this feedback? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await deleteFeedback(id)

      setSuccess('Feedback deleted successfully.')
      await loadFeedback(false)
    } catch (err) {
      setError(err.message || 'Unable to delete feedback.')
    }
  }

  // Analyse feedback using Gemini AI
  const handleAnalyse = async (id) => {
    try {
      setAnalysingId(id)
      setError('')
      setSuccess('')

      const result = await analyseFeedback(id)

      setFeedback((previousFeedback) =>
        previousFeedback.map((item) =>
          item._id === id ? result.feedback : item
        )
      )

      setSuccess('Gemini AI successfully analysed the customer feedback.')
    } catch (err) {
      setError(err.message || 'Unable to analyse feedback. Please try again.')
    } finally {
      setAnalysingId(null)
    }
  }

  // Filter feedback
  const filteredFeedback = feedback.filter((item) => {
    const searchText = `
      ${item.customerName}
      ${item.email}
      ${item.message}
    `.toLowerCase()

    return searchText.includes(search.toLowerCase())
  })

  // Feedback metrics
  const totalFeedback = feedback.length

  const ratedFeedback = feedback.filter(
    (item) => Number(item.rating) > 0
  ).length

  const averageRating = ratedFeedback
    ? (
        feedback.reduce(
          (total, item) => total + Number(item.rating || 0),
          0
        ) / ratedFeedback
      ).toFixed(1)
    : '0.0'

  const analysedFeedback = feedback.filter(
    (item) => ['positive', 'negative', 'neutral'].includes(item.sentiment)
  ).length

  const positiveCount = feedback.filter(
    (item) => item.sentiment === 'positive'
  ).length

  const negativeCount = feedback.filter(
    (item) => item.sentiment === 'negative'
  ).length

  const neutralCount = feedback.filter(
    (item) => item.sentiment === 'neutral'
  ).length

  const sentimentPercentage = (count) =>
    analysedFeedback
      ? Math.round((count / analysedFeedback) * 100)
      : 0

  // Format date
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  if (loading) {
    return (
      <p className="p-8 text-slate-500">
        Loading customer feedback...
      </p>
    )
  }

  return (
    <div className="space-y-7">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Feedback
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Understand your customers and manage their feedback.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Feedback
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Feedback"
          value={totalFeedback}
          icon={<MessageSquare size={20} />}
        />

        <MetricCard
          title="Average Rating"
          value={`${averageRating} / 5`}
          icon={<Star size={20} />}
        />

        <MetricCard
          title="Rated Feedback"
          value={ratedFeedback}
          icon={<Users size={20} />}
        />

        <MetricCard
          title="AI Analysed"
          value={`${analysedFeedback} / ${totalFeedback}`}
          icon={<Brain size={20} />}
        />
      </div>

      {/* AI Sentiment Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              AI Sentiment Overview
            </h2>
            <p className="text-sm text-slate-500">
              Customer sentiment based on Gemini AI analysis.
            </p>
          </div>
        </div>

        {analysedFeedback > 0 ? (
          <>
            <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
              {positiveCount > 0 && (
                <div
                  className="bg-emerald-500 transition-all"
                  style={{
                    width: `${sentimentPercentage(positiveCount)}%`,
                  }}
                />
              )}

              {neutralCount > 0 && (
                <div
                  className="bg-amber-400 transition-all"
                  style={{
                    width: `${sentimentPercentage(neutralCount)}%`,
                  }}
                />
              )}

              {negativeCount > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{
                    width: `${sentimentPercentage(negativeCount)}%`,
                  }}
                />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SentimentCard
                label="Positive"
                count={positiveCount}
                percentage={sentimentPercentage(positiveCount)}
                icon={<ThumbsUp size={19} />}
                color="emerald"
              />

              <SentimentCard
                label="Neutral"
                count={neutralCount}
                percentage={sentimentPercentage(neutralCount)}
                icon={<Minus size={19} />}
                color="amber"
              />

              <SentimentCard
                label="Negative"
                count={negativeCount}
                percentage={sentimentPercentage(negativeCount)}
                icon={<ThumbsDown size={19} />}
                color="red"
              />
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <Brain className="mx-auto mb-2 text-slate-400" size={30} />
            <p className="font-medium text-slate-700">
              No AI analysis available yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Analyse customer reviews to see their overall sentiment.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              {editingId ? 'Edit Feedback' : 'Add Customer Feedback'}
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer Name
              </label>

              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rating
              </label>

              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Very Poor</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Feedback Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="What did the customer say about your product or service?"
                className="w-full resize-y rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Feedback'
                    : 'Save Feedback'}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Customer Reviews
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Feedback received from your customers.
            </p>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-64"
            />
          </div>
        </div>

        <div className="space-y-4">

          {filteredFeedback.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-slate-200 p-5"
            >

              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                    {(item.customerName || 'A')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {item.customerName || 'Anonymous'}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {item.email || 'No email provided'}
                    </p>

                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= Number(item.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }
                        />
                      ))}

                      <span className="ml-1 text-xs text-slate-500">
                        {item.rating || 0}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(item.createdAt)}
                  </span>

                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    title="Edit feedback"
                    className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    title="Delete feedback"
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.message}
              </p>

              {/* AI Analysis */}
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                    <Sparkles size={17} />
                    Gemini AI Analysis
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAnalyse(item._id)}
                    disabled={analysingId !== null}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {analysingId === item._id ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Analysing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        {item.sentiment === 'unanalysed'
                          ? 'Analyse with AI'
                          : 'Analyse Again'}
                      </>
                    )}
                  </button>
                </div>

                {['positive', 'negative', 'neutral'].includes(item.sentiment) ? (
                  <div className="mt-4 space-y-3">

                    <div className="flex flex-wrap items-center gap-3">
                      <SentimentBadge sentiment={item.sentiment} />

                      <span className="text-xs font-medium text-slate-500">
                        Confidence: {
                          typeof item.sentimentScore === 'number'
                            ? `${(item.sentimentScore * 100).toFixed(0)}%`
                            : 'Not available'
                        }
                      </span>
                    </div>

                    {item.aiSummary && (
                      <div className="rounded-lg border border-indigo-100 bg-white p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                          AI-generated summary
                        </p>

                        <p className="text-sm leading-6 text-slate-700">
                          {item.aiSummary}
                        </p>
                      </div>
                    )}

                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    This feedback has not been analysed yet. Click Analyse with AI to understand the customer's sentiment.
                  </p>
                )}
              </div>

            </div>
          ))}

          {filteredFeedback.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle
                size={38}
                className="mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-700">
                {search
                  ? 'No matching feedback found.'
                  : 'No customer feedback yet.'}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {search
                  ? 'Try searching with another keyword.'
                  : 'Customer reviews will appear here when added.'}
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </h3>
    </div>
  )
}

function SentimentBadge({ sentiment }) {
  const styles = {
    positive: 'bg-emerald-100 text-emerald-700',
    negative: 'bg-red-100 text-red-700',
    neutral: 'bg-amber-100 text-amber-700',
  }

  const icons = {
    positive: <ThumbsUp size={14} />,
    negative: <ThumbsDown size={14} />,
    neutral: <Minus size={14} />,
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${styles[sentiment] || 'bg-slate-100 text-slate-600'}`}
    >
      {icons[sentiment]}
      {sentiment}
    </span>
  )
}

function SentimentCard({ label, count, percentage, icon, color }) {
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorStyles[color]}`}>
          {icon}
        </span>

        <span className="text-sm font-semibold text-slate-500">
          {percentage}%
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {label}
      </p>

      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        {count}
      </h3>
    </div>
  )
}

export default Feedback
