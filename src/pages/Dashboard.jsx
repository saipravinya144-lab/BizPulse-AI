
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IndianRupee,
  ShoppingBag,
  Package,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  Upload,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Star,
  LoaderCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

import { getBusinessReports } from '../services/reportService'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const formatCurrency = (value) =>
  currencyFormatter.format(Number(value || 0))

const formatMonth = (year, month) =>
  new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
  })

function calculateGrowth(monthlyRevenue) {
  if (!monthlyRevenue || monthlyRevenue.length < 2) return null

  const sorted = [...monthlyRevenue].sort((a, b) => {
    return (
      a._id.year * 12 + a._id.month -
      (b._id.year * 12 + b._id.month)
    )
  })

  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]

  const latestMonth = latest._id.year * 12 + latest._id.month
  const previousMonth = previous._id.year * 12 + previous._id.month

  // Compare only consecutive calendar months
  if (latestMonth - previousMonth !== 1) return null

  if (previous.revenue === 0) return null

  return (
    ((latest.revenue - previous.revenue) / previous.revenue) * 100
  )
}

function Dashboard() {
  const navigate = useNavigate()

  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getBusinessReports()
      setReports(data.reports)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <LoaderCircle size={22} className="animate-spin text-indigo-600" />
          Loading your business dashboard...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const sales = reports?.salesOverview || {}
  const inventory = reports?.inventoryOverview || {}
  const feedback = reports?.feedbackOverview || {}

  const monthlyRevenue = reports?.monthlyRevenue || []
  const recentSales = reports?.recentSales || []
  const productPerformance = reports?.productPerformance || []

  const totalRevenue = sales.totalRevenue || 0
  const totalSales = sales.totalSales || 0
  const totalProducts = inventory.totalProducts || 0

  const growth = calculateGrowth(monthlyRevenue)

  const chartData = monthlyRevenue.map((item) => ({
    month: formatMonth(item._id.year, item._id.month),
    revenue: item.revenue,
  }))

  // Build factual business observations from available data
  const insights = []

  if ((inventory.lowStockProducts || 0) > 0) {
    insights.push({
      title: 'Inventory needs attention',
      description: `${inventory.lowStockProducts} product(s) have reached their low-stock threshold.`,
      icon: AlertTriangle,
      color: 'text-amber-600',
      background: 'bg-amber-50',
    })
  }

  if ((inventory.lowStockProducts || 0) === 0 && totalProducts > 0) {
    insights.push({
      title: 'Inventory looks healthy',
      description: 'No products are currently below their low-stock threshold.',
      icon: Package,
      color: 'text-green-600',
      background: 'bg-green-50',
    })
  }

  if ((feedback.negative || 0) > 0) {
    insights.push({
      title: 'Review customer feedback',
      description: `${feedback.negative} negative feedback item(s) may need your attention.`,
      icon: AlertTriangle,
      color: 'text-amber-600',
      background: 'bg-amber-50',
    })
  }

  if ((feedback.totalFeedback || 0) > 0) {
    insights.push({
      title: 'Customer feedback overview',
      description: `${feedback.positive || 0} positive response(s) out of ${feedback.totalFeedback} total feedback entries.`,
      icon: Star,
      color: 'text-indigo-600',
      background: 'bg-indigo-50',
    })
  }

  if (productPerformance.length > 0) {
    const topProduct = productPerformance[0]

    insights.push({
      title: 'Top-performing product',
      description: `${topProduct.productName} has generated ${formatCurrency(topProduct.revenue)} in recorded sales.`,
      icon: TrendingUp,
      color: 'text-green-600',
      background: 'bg-green-50',
    })
  }

  if (insights.length === 0) {
    insights.push({
      title: 'Your business insights will grow here',
      description: 'Add sales, inventory and customer feedback data to unlock useful business observations.',
      icon: Sparkles,
      color: 'text-indigo-600',
      background: 'bg-indigo-50',
    })
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      description: 'Revenue from all recorded sales',
      icon: IndianRupee,
    },
    {
      title: 'Total Sales',
      value: totalSales,
      description: 'Completed sales transactions',
      icon: ShoppingBag,
    },
    {
      title: 'Products',
      value: totalProducts,
      description: 'Products in your inventory',
      icon: Package,
    },
    {
      title: 'Business Growth',
      value: growth === null
        ? '—'
        : `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
      description: growth === null
        ? 'Requires consecutive months of sales'
        : 'Change in revenue from previous month',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">
            BUSINESS OVERVIEW
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening with your business.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">
                  {metric.title}
                </p>

                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-5 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                {metric.value}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                {metric.description}
              </p>
            </div>
          )
        })}
      </section>

      {/* Main dashboard content */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Revenue Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your business revenue over time
              </p>
            </div>

            <TrendingUp className="text-indigo-600" size={22} />
          </div>

          {chartData.length > 0 ? (
            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 15, left: 5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366F1"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#6366F1"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      'Revenue',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fill="url(#dashboardRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-600">
                <TrendingUp size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No revenue data available yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Record or import sales to start viewing your revenue trends.
              </p>

              <button
                onClick={() => navigate('/sales')}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Go to Sales
              </button>
            </div>
          )}
        </div>

        {/* Business insights */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={21} />

            <h2 className="font-bold text-slate-900">
              Business Insights
            </h2>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Observations based on your actual business data
          </p>

          <div className="mt-5 space-y-3">
            {insights.slice(0, 4).map((insight, index) => {
              const Icon = insight.icon

              return (
                <div
                  key={index}
                  className="rounded-xl border border-indigo-100 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${insight.background} ${insight.color}`}>
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {insight.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom section */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest recorded sales
              </p>
            </div>

            <button
              onClick={() => navigate('/sales')}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
              title="View all sales"
            >
              <ArrowUpRight size={19} />
            </button>
          </div>

          {recentSales.length > 0 ? (
            <div className="mt-5 space-y-4">
              {recentSales.map((sale, index) => (
                <div
                  key={sale._id || index}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                      <ShoppingBag size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {sale.productName || 'Product'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {sale.quantity} unit(s) ·{' '}
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString('en-IN')
                          : 'Date unavailable'}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <ShoppingBag size={28} className="text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No transactions yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Your recent sales will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your business workspace.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <Plus size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Add Product
                </p>

                <p className="text-xs text-slate-500">
                  Manage inventory
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/sales')}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <Upload size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Import Sales
                </p>

                <p className="text-xs text-slate-500">
                  Upload a CSV file
                </p>
              </div>
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Customer feedback recorded
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {feedback.totalFeedback || 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Average rating: {Number(feedback.averageRating || 0).toFixed(1)} / 5
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
