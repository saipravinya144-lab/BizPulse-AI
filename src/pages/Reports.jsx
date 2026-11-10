
import { useEffect, useState } from 'react'
import {
  IndianRupee,
  ShoppingCart,
  Package,
  TrendingUp,
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileBarChart,
  FileDown,
  Star,
} from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { getBusinessReports } from '../services/reportService'

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)

const formatMonth = (month, year) =>
  new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
  })

const formatPDFCurrency = (value = 0) =>
  `INR ${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="rounded-xl bg-indigo-50 p-2.5">
          <Icon size={19} className="text-indigo-600" />
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {children}
    </section>
  )
}

export default function Reports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getBusinessReports()
      setReports(response.reports)
    } catch (err) {
      setError(err.message || 'Unable to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleDownloadPDF = () => {
    if (!reports) return

    try {
      setExporting(true)

      const doc = new jsPDF()

      const {
        salesOverview,
        monthlyRevenue,
        productPerformance,
        inventoryOverview,
        feedbackOverview,
        paymentBreakdown,
        recentSales,
      } = reports

      const pageWidth = doc.internal.pageSize.getWidth()

      // Report heading
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('BizPulse AI', 14, 20)

      doc.setFontSize(15)
      doc.setFont('helvetica', 'normal')
      doc.text('Business Performance Report', 14, 30)

      doc.setFontSize(9)
      doc.setTextColor(110, 110, 110)
      doc.text(
        `Generated on: ${new Date().toLocaleString('en-IN')}`,
        14,
        38
      )

      doc.setDrawColor(210, 210, 210)
      doc.line(14, 44, pageWidth - 14, 44)

      // Sales overview
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('1. Sales Overview', 14, 54)

      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', formatPDFCurrency(salesOverview.totalRevenue)],
          ['Total Transactions', String(salesOverview.totalSales)],
          ['Units Sold', String(salesOverview.totalUnitsSold)],
          [
            'Average Order Value',
            formatPDFCurrency(salesOverview.averageOrderValue),
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
      })

      // Monthly revenue
      let currentY = doc.lastAutoTable.finalY + 12

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('2. Monthly Revenue', 14, currentY)

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Month', 'Revenue', 'Transactions']],
        body: monthlyRevenue.length
          ? monthlyRevenue.map((item) => [
              formatMonth(item._id.month, item._id.year),
              formatPDFCurrency(item.revenue),
              String(item.salesCount),
            ])
          : [['No sales data available', '-', '-']],
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 9,
        },
      })

      // Product performance
      currentY = doc.lastAutoTable.finalY + 12

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('3. Product Performance', 14, currentY)

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Product', 'Units Sold', 'Revenue']],
        body: productPerformance.length
          ? productPerformance.map((product) => [
              product.productName,
              String(product.unitsSold),
              formatPDFCurrency(product.revenue),
            ])
          : [['No product sales available', '-', '-']],
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 9,
        },
      })

      // Inventory
      currentY = doc.lastAutoTable.finalY + 12

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('4. Inventory Report', 14, currentY)

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Metric', 'Value']],
        body: [
          ['Total Products', String(inventoryOverview.totalProducts)],
          ['Total Stock Units', String(inventoryOverview.totalStock)],
          ['Low Stock Products', String(inventoryOverview.lowStockProducts)],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 9,
        },
      })

      // Customer feedback
      currentY = doc.lastAutoTable.finalY + 12

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('5. Customer Feedback', 14, currentY)

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Metric', 'Value']],
        body: [
          ['Total Feedback', String(feedbackOverview.totalFeedback)],
          [
            'Average Rating',
            `${Number(feedbackOverview.averageRating || 0).toFixed(1)} / 5`,
          ],
          ['Positive Feedback', String(feedbackOverview.positive)],
          ['Neutral Feedback', String(feedbackOverview.neutral)],
          ['Negative Feedback', String(feedbackOverview.negative)],
          ['Unanalysed Feedback', String(feedbackOverview.unanalyzed)],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 9,
        },
      })

      // Payment breakdown
      currentY = doc.lastAutoTable.finalY + 12

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('6. Payment Method Breakdown', 14, currentY)

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Payment Method', 'Transactions', 'Revenue']],
        body: paymentBreakdown.length
          ? paymentBreakdown.map((payment) => [
              payment._id,
              String(payment.transactions),
              formatPDFCurrency(payment.revenue),
            ])
          : [['No payment data available', '-', '-']],
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 9,
        },
      })

      // Recent transactions
      currentY = doc.lastAutoTable.finalY + 12

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('7. Recent Transactions', 14, currentY)

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Product', 'Quantity', 'Date', 'Payment', 'Amount']],
        body: recentSales.length
          ? recentSales.map((sale) => [
              sale.productName,
              String(sale.quantity),
              new Date(sale.saleDate).toLocaleDateString('en-IN'),
              sale.paymentMethod,
              formatPDFCurrency(sale.totalAmount),
            ])
          : [['No transactions available', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
      })

      // Footer and page numbers
      const pageCount = doc.internal.getNumberOfPages()

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page)

        const pageHeight = doc.internal.pageSize.getHeight()

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 130)

        doc.text(
          'Generated by BizPulse AI - Business Copilot',
          14,
          pageHeight - 10
        )

        doc.text(
          `Page ${page} of ${pageCount}`,
          pageWidth - 14,
          pageHeight - 10,
          { align: 'right' }
        )
      }

      doc.save(
        `BizPulse-Business-Report-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      )
    } catch (err) {
      console.error('PDF export error:', err)
      window.alert('Unable to generate the PDF report. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto animate-spin text-indigo-600"
            size={30}
          />

          <p className="mt-3 text-sm text-slate-500">
            Generating your business reports...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto text-red-500" size={30} />

        <p className="mt-3 font-semibold text-red-700">
          Unable to load reports
        </p>

        <p className="mt-1 text-sm text-red-600">{error}</p>

        <button
          onClick={fetchReports}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const {
    salesOverview,
    monthlyRevenue,
    productPerformance,
    inventoryOverview,
    feedbackOverview,
    paymentBreakdown,
    recentSales,
  } = reports

  const monthlyChartData = monthlyRevenue.map((item) => ({
    month: formatMonth(item._id.month, item._id.year),
    revenue: item.revenue,
  }))

  const totalPaymentRevenue = paymentBreakdown.reduce(
    (sum, item) => sum + item.revenue,
    0
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart className="text-indigo-600" size={25} />

            <h1 className="text-2xl font-bold text-slate-900">
              Business Reports
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Understand your business performance through real-time data.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchReports}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh Reports
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileDown size={17} />
            {exporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Sales overview */}
      <div>
        <h2 className="mb-3 font-semibold text-slate-800">
          Sales Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(salesOverview.totalRevenue)}
            subtitle="Revenue from all recorded sales"
            icon={IndianRupee}
          />

          <StatCard
            title="Total Transactions"
            value={salesOverview.totalSales}
            subtitle="Completed sales records"
            icon={ShoppingCart}
          />

          <StatCard
            title="Units Sold"
            value={salesOverview.totalUnitsSold}
            subtitle="Total products sold"
            icon={Package}
          />

          <StatCard
            title="Average Order Value"
            value={formatCurrency(salesOverview.averageOrderValue)}
            subtitle="Average revenue per transaction"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Revenue and product performance */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Monthly Revenue"
          subtitle="Revenue grouped by month"
        >
          {monthlyChartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No sales data available yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />

                <Bar
                  dataKey="revenue"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          title="Top Performing Products"
          subtitle="Top 10 products ranked by revenue"
        >
          {productPerformance.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No product sales available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {productPerformance.map((product, index) => (
                <div
                  key={product._id || product.productName}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {product.productName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {product.unitsSold} units sold
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Inventory and feedback */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Inventory Report"
          subtitle="Current stock overview"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-center">
              <p className="text-2xl font-bold text-indigo-700">
                {inventoryOverview.totalProducts}
              </p>

              <p className="mt-1 text-xs text-indigo-600">Products</p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {inventoryOverview.totalStock}
              </p>

              <p className="mt-1 text-xs text-emerald-600">Stock Units</p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {inventoryOverview.lowStockProducts}
              </p>

              <p className="mt-1 text-xs text-amber-600">Low Stock</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Customer Feedback"
          subtitle="Ratings and AI sentiment analysis"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {Number(feedbackOverview.averageRating || 0).toFixed(1)}

                <span className="ml-1 text-sm font-normal text-slate-400">
                  / 5
                </span>
              </p>

              <div className="mt-1 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill={
                      index < Math.round(feedbackOverview.averageRating || 0)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {feedbackOverview.totalFeedback}
              </p>

              <p className="text-xs text-slate-500">Total Feedback</p>
            </div>
          </div>

          {[
            {
              label: 'Positive',
              count: feedbackOverview.positive,
              color: 'bg-emerald-500',
            },
            {
              label: 'Neutral',
              count: feedbackOverview.neutral,
              color: 'bg-amber-400',
            },
            {
              label: 'Negative',
              count: feedbackOverview.negative,
              color: 'bg-red-500',
            },
            {
              label: 'Unanalysed',
              count: feedbackOverview.unanalyzed,
              color: 'bg-slate-400',
            },
          ].map((item) => {
            const percentage =
              feedbackOverview.totalFeedback > 0
                ? (item.count / feedbackOverview.totalFeedback) * 100
                : 0

            return (
              <div key={item.label} className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-600">{item.label}</span>

                  <span className="font-medium text-slate-800">
                    {item.count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </SectionCard>
      </div>

      {/* Payment breakdown */}
      <SectionCard
        title="Payment Method Breakdown"
        subtitle="Revenue contribution by payment method"
      >
        {paymentBreakdown.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No payment data available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {paymentBreakdown.map((payment) => {
              const percentage =
                totalPaymentRevenue > 0
                  ? (payment.revenue / totalPaymentRevenue) * 100
                  : 0

              return (
                <div key={payment._id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={17} className="text-indigo-500" />

                      <span className="text-sm font-medium text-slate-700">
                        {payment._id}
                      </span>

                      <span className="text-xs text-slate-400">
                        ({payment.transactions} transactions)
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(payment.revenue)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Recent transactions */}
      <SectionCard
        title="Recent Transactions"
        subtitle="Your latest five recorded sales"
      >
        {recentSales.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No transactions recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>

              <tbody>
                {recentSales.map((sale, index) => (
                  <tr
                    key={sale._id || `${sale.saleDate}-${index}`}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-4 text-sm font-medium text-slate-800">
                      {sale.productName}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {sale.quantity}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {new Date(sale.saleDate).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {sale.paymentMethod}
                    </td>

                    <td className="py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
