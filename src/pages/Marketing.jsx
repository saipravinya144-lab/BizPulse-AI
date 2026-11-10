
import { useEffect, useState } from 'react'
import {
  Megaphone,
  Sparkles,
  Copy,
  Trash2,
  Clock,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Share2,
  MessageCircle,
  WandSparkles,
} from 'lucide-react'

import {
  generateMarketingContent,
  getMarketingHistory,
  deleteMarketingContent,
} from '../services/marketingService'

import { getProducts } from '../services/productService'

const platforms = ['Instagram', 'Facebook', 'WhatsApp', 'General']

const contentTypes = [
  'Caption',
  'Advertisement',
  'Product Description',
  'Promotion',
]

const platformIcons = {
  Instagram: Share2,
  Facebook: Share2,
  WhatsApp: MessageCircle,
  General: Megaphone,
}

const Marketing = () => {
  const [products, setProducts] = useState([])
  const [history, setHistory] = useState([])

  const [productId, setProductId] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [contentType, setContentType] = useState('Caption')
  const [audience, setAudience] = useState('')
  const [prompt, setPrompt] = useState('')

  const [generatedContent, setGeneratedContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadData = async () => {
    try {
      setHistoryLoading(true)

      const [productResponse, historyResponse] = await Promise.all([
        getProducts(),
        getMarketingHistory(),
      ])

      setProducts(productResponse.products || [])
      setHistory(historyResponse.contents || [])
    } catch (err) {
      setError(err.message || 'Unable to load Marketing Studio data.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    setGeneratedContent(null)
    setLoading(true)

    try {
      const response = await generateMarketingContent({
        productId: productId || undefined,
        platform,
        contentType,
        audience,
        prompt,
      })

      setGeneratedContent(response.content)
      setHistory((previous) => [response.content, ...previous])
    } catch (err) {
      setError(err.message || 'Unable to generate marketing content.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Unable to copy content. Please copy it manually.')
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this generated content?'
    )

    if (!confirmed) return

    try {
      await deleteMarketingContent(id)

      setHistory((previous) =>
        previous.filter((item) => item._id !== id)
      )

      if (generatedContent?._id === id) {
        setGeneratedContent(null)
      }
    } catch (err) {
      setError(err.message || 'Unable to delete content.')
    }
  }

  const selectedProduct = products.find(
    (product) => product._id === productId
  )

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <Sparkles size={16} />
            AI POWERED MARKETING
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Marketing Studio
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create engaging marketing content for your business with AI.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
          <WandSparkles size={18} />
          Powered by Gemini AI
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Generator */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Megaphone size={22} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Create Marketing Content
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tell AI what you want to create.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Product
              </label>

              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">General business content</option>

                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Platform
              </label>

              <div className="grid grid-cols-2 gap-2">
                {platforms.map((item) => {
                  const Icon = platformIcons[item]
                  const active = platform === item

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPlatform(item)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        active
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 text-slate-600 hover:border-violet-200'
                      }`}
                    >
                      <Icon size={17} />
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Content Type
              </label>

              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Audience */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Target Audience
              </label>

              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Young adults, college students..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Prompt */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Custom Instructions
              </label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Describe the tone, style, offers or details you want..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Selected Product Preview */}
            {selectedProduct && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-800">
                  {selectedProduct.name}
                </p>

                <p className="mt-1 text-slate-500">
                  ₹{selectedProduct.price} · Stock: {selectedProduct.stock}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate with AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Content Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Generated Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your AI-generated marketing content appears here.
              </p>
            </div>

            {generatedContent && (
              <button
                onClick={() => handleCopy(generatedContent.generatedText)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}

                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {generatedContent ? (
            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  {generatedContent.platform}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {generatedContent.contentType}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {generatedContent.generatedText}
              </p>
            </div>
          ) : (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Sparkles size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                Ready to create something amazing?
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Choose your product, platform and content type. Your AI-generated
                marketing content will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Marketing History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Marketing History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Previously generated and saved content.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={16} />
            {history.length} saved items
          </div>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle size={26} className="animate-spin text-violet-600" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-12 text-center">
            <Megaphone size={30} className="mx-auto mb-3 text-slate-400" />

            <p className="font-medium text-slate-700">
              No marketing content yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your generated content will be saved here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {item.platform}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.contentType}
                    </span>

                    {item.product?.name && (
                      <span className="text-xs text-slate-500">
                        {item.product.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.generatedText)}
                      title="Copy content"
                      className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                    >
                      <Copy size={17} />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete content"
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {item.generatedText}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketing
