
import { useEffect, useState } from 'react'

import {
  Plus,
  Search,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  X,
  CalendarDays,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
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

import Papa from 'papaparse'

import {
  getSales,
  createSale,
  importSales,
} from '../services/salesService'

import { getProducts } from '../services/productService'

function Sales() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // CSV import states
  const [csvFile, setCsvFile] = useState(null)
  const [csvRows, setCsvRows] = useState([])
  const [csvErrors, setCsvErrors] = useState([])
  const [csvSuccess, setCsvSuccess] = useState('')
  const [csvLoading, setCsvLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    customerName: '',
    paymentMethod: 'Cash',
  })

  // Load sales and products
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [salesData, productsData] = await Promise.all([
        getSales(),
        getProducts(),
      ])

      setSales(salesData.sales || [])
      setProducts(productsData.products || [])
    } catch (err) {
      setError(err.message || 'Unable to load sales data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Record a sale
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      await createSale({
        ...formData,
        quantity: Number(formData.quantity),
      })

      setFormData({
        productId: '',
        quantity: 1,
        customerName: '',
        paymentMethod: 'Cash',
      })

      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to record sale.')
    } finally {
      setSaving(false)
    }
  }

  // Currency formatter
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)

  // Reset CSV import
  const resetCSV = () => {
    setCsvFile(null)
    setCsvRows([])
    setCsvErrors([])
    setCsvSuccess('')

    const fileInput = document.getElementById('sales-csv-file')
    if (fileInput) fileInput.value = ''
  }

  // Read and validate CSV
  const handleCSVChange = (e) => {
    const file = e.target.files?.[0]

    setCsvFile(file || null)
    setCsvRows([])
    setCsvErrors([])
    setCsvSuccess('')

    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvErrors(['Please select a CSV file.'])
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const errors = []
        const rows = []

        if (!results.meta.fields?.length) {
          setCsvErrors(['The CSV file appears to be empty or has no header row.'])
          return
        }

        const requiredColumns = [
          'product name',
          'quantity',
          'payment method',
        ]

        const availableColumns = results.meta.fields

        const missingColumns = requiredColumns.filter(
          (column) => !availableColumns.includes(column)
        )

        if (missingColumns.length > 0) {
          setCsvErrors([
            `Missing required column(s): ${missingColumns.join(', ')}.`,
          ])
          return
        }

        if (results.data.length === 0) {
          setCsvErrors(['The CSV file contains no sales rows.'])
          return
        }

        if (results.data.length > 500) {
          setCsvErrors(['A maximum of 500 sales can be imported at once.'])
          return
        }

        const allowedPaymentMethods = [
          'cash',
          'card',
          'upi',
          'online',
          'other',
        ]

        results.data.forEach((row, index) => {
          const rowNumber = index + 2
          const productName = (row['product name'] || '').trim()
          const quantity = Number(row.quantity)
          const paymentMethod = (row['payment method'] || '').trim()

          if (!productName) {
            errors.push(`Row ${rowNumber}: Product name is missing.`)
            return
          }

          const product = products.find(
            (item) =>
              item.name.trim().toLowerCase() ===
              productName.toLowerCase()
          )

          if (!product) {
            errors.push(
              `Row ${rowNumber}: "${productName}" was not found in your inventory.`
            )
            return
          }

          if (!Number.isInteger(quantity) || quantity <= 0) {
            errors.push(
              `Row ${rowNumber}: Quantity must be a positive whole number.`
            )
            return
          }

          if (
            !allowedPaymentMethods.includes(
              paymentMethod.toLowerCase()
            )
          ) {
            errors.push(
              `Row ${rowNumber}: Invalid payment method. Use Cash, Card, UPI, Online or Other.`
            )
            return
          }

          let saleDate = new Date()

          if (row['sale date']?.trim()) {
            saleDate = new Date(row['sale date'].trim())

            if (Number.isNaN(saleDate.getTime())) {
              errors.push(`Row ${rowNumber}: Invalid sale date.`)
              return
            }
          }

          rows.push({
            productId: product._id,
            quantity,
            customerName:
              (row['customer name'] || '').trim() ||
              'Walk-in Customer',
            paymentMethod:
              paymentMethod.toLowerCase() === 'cash'
                ? 'Cash'
                : paymentMethod.toLowerCase() === 'card'
                  ? 'Card'
                  : paymentMethod.toLowerCase() === 'upi'
                    ? 'UPI'
                    : paymentMethod.toLowerCase() === 'online'
                      ? 'Online'
                      : 'Other',
            saleDate: saleDate.toISOString(),
          })
        })

        setCsvErrors(errors)
        setCsvRows(rows)
      },
      error: () => {
        setCsvErrors(['Unable to read this CSV file.'])
      },
    })
  }

  // Import validated CSV rows
  const handleCSVImport = async () => {
    if (!csvRows.length || csvErrors.length > 0) return

    try {
      setImporting(true)
      setCsvSuccess('')
      setError('')

      const result = await importSales(csvRows)

      setCsvSuccess(
        `Successfully imported ${result.importedCount} sales. Total revenue: ${formatCurrency(result.totalRevenue)}.`
      )

      setCsvFile(null)
      setCsvRows([])
      setCsvErrors([])

      const fileInput = document.getElementById('sales-csv-file')
      if (fileInput) fileInput.value = ''

      await loadData()
    } catch (err) {
      setCsvErrors([
        err.message || 'Unable to import sales. Please check stock availability.',
      ])
    } finally {
      setImporting(false)
    }
  }

  // Get the selected date range
  const getDateRange = () => {
    const today = new Date()

    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    )

    if (dateFilter === 'thisMonth') {
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end,
      }
    }

    if (dateFilter === 'last3') {
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 2, 1),
        end,
      }
    }

    if (dateFilter === 'last6') {
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 5, 1),
        end,
      }
    }

    if (dateFilter === 'custom') {
      if (!customStartDate || !customEndDate) {
        return null
      }

      const [startYear, startMonth, startDay] =
        customStartDate.split('-').map(Number)

      const [endYear, endMonth, endDay] =
        customEndDate.split('-').map(Number)

      const start = new Date(startYear, startMonth - 1, startDay)

      const endDate = new Date(endYear, endMonth - 1, endDay)
      endDate.setDate(endDate.getDate() + 1)

      if (start >= endDate || start > today) {
        return null
      }

      return { start, end: endDate }
    }

    return { start: null, end: null }
  }

  const dateRange = getDateRange()

  // Filter sales by selected date range
  const dateFilteredSales = dateRange
    ? sales.filter((sale) => {
        const saleDate = new Date(sale.saleDate)

        return (
          saleDate >= dateRange.start &&
          saleDate < dateRange.end
        )
      })
    : []

  // Calculate metrics
  const totalRevenue = dateFilteredSales.reduce(
    (total, sale) =>
      total + Number(sale.totalAmount || 0),
    0
  )

  const totalUnits = dateFilteredSales.reduce(
    (total, sale) =>
      total + Number(sale.quantity || 0),
    0
  )

  const averageOrderValue = dateFilteredSales.length
    ? totalRevenue / dateFilteredSales.length
    : 0

  // Build chart data
  const monthlyRevenue = (() => {
    if (!dateRange) return []

    const months = []

    const firstMonth = new Date(
      dateRange.start.getFullYear(),
      dateRange.start.getMonth(),
      1
    )

    const lastIncludedDate = new Date(dateRange.end)
    lastIncludedDate.setDate(lastIncludedDate.getDate() - 1)

    const lastMonth = new Date(
      lastIncludedDate.getFullYear(),
      lastIncludedDate.getMonth(),
      1
    )

    for (
      let date = new Date(firstMonth);
      date <= lastMonth;
      date.setMonth(date.getMonth() + 1)
    ) {
      const year = date.getFullYear()
      const month = date.getMonth()

      const revenue = dateFilteredSales.reduce(
        (total, sale) => {
          const saleDate = new Date(sale.saleDate)

          if (
            saleDate.getFullYear() === year &&
            saleDate.getMonth() === month
          ) {
            return total + Number(sale.totalAmount || 0)
          }

          return total
        },
        0
      )

      months.push({
        month: date.toLocaleDateString('en-IN', {
          month: 'short',
          year: '2-digit',
        }),
        revenue,
      })
    }

    return months
  })()

  // Search within date-filtered sales
  const filteredSales = dateFilteredSales.filter((sale) =>
    `${sale.productName} ${sale.customerName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <p className="p-8 text-slate-500">
        Loading sales data...
      </p>
    )
  }

  return (
    <div className="space-y-7">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track transactions and monitor your business revenue.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Record a Sale
        </button>
      </div>

      {/* General Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* CSV Import */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileSpreadsheet size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Import Sales from CSV
            </h2>

            <p className="text-sm text-slate-500">
              Upload a spreadsheet to import multiple transactions.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">

          <label
            htmlFor="sales-csv-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center"
          >
            <Upload size={28} className="text-indigo-600" />

            <span className="font-semibold text-slate-700">
              Choose a CSV file
            </span>

            <span className="text-xs text-slate-500">
              CSV files only · Maximum 500 sales per import
            </span>
          </label>

          <input
            id="sales-csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleCSVChange}
            className="hidden"
          />

          {csvFile && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileSpreadsheet size={18} className="shrink-0 text-emerald-600" />
                <span className="truncate text-sm font-medium text-slate-700">
                  {csvFile.name}
                </span>
              </div>

              <button
                type="button"
                onClick={resetCSV}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
          <p className="mb-2 font-semibold">CSV format required</p>

          <p className="mb-2">
            Your first row must contain these column headers:
          </p>

          <code className="block overflow-x-auto rounded-lg bg-white p-3 text-xs">
            product name, quantity, customer name, payment method, sale date
          </code>

          <p className="mt-2 text-xs">
            Required: product name, quantity and payment method.
            Customer name and sale date are optional.
            Product names must match your Inventory.
          </p>
        </div>

        {/* CSV Errors */}
        {csvErrors.length > 0 && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold text-red-700">
              <AlertCircle size={18} />
              Please fix these issues
            </div>

            <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
              {csvErrors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CSV Preview */}
        {csvRows.length > 0 && csvErrors.length === 0 && (
          <div className="mt-5">

            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                Import Preview
              </h3>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {csvRows.length} valid rows
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-500">
              Review the transactions before importing them.
              The backend will verify available stock before saving.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {csvRows.slice(0, 5).map((row, index) => {
                    const product = products.find(
                      (item) => item._id === row.productId
                    )

                    return (
                      <tr key={index} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {product?.name || 'Unknown'}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {row.quantity}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {row.customerName}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {row.paymentMethod}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {csvRows.length > 5 && (
              <p className="mt-2 text-xs text-slate-500">
                Showing the first 5 of {csvRows.length} rows.
              </p>
            )}

            <button
              type="button"
              onClick={handleCSVImport}
              disabled={importing || csvErrors.length > 0}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={17} />
              {importing ? 'Importing...' : `Import ${csvRows.length} Sales`}
            </button>
          </div>
        )}

        {/* CSV Success */}
        {csvSuccess && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            {csvSuccess}
          </div>
        )}

      </div>

      {/* Date Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={19} className="text-indigo-600" />

          <h2 className="font-semibold text-slate-800">
            Filter Sales by Date
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'This Month', value: 'thisMonth' },
            { label: 'Last 3 Months', value: 'last3' },
            { label: 'Last 6 Months', value: 'last6' },
            { label: 'Custom Range', value: 'custom' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDateFilter(option.value)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                dateFilter === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Date
              </label>

              <input
                type="date"
                value={customStartDate}
                max={customEndDate || undefined}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End Date
              </label>

              <input
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                max={new Date().toLocaleDateString('en-CA')}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            {(!customStartDate || !customEndDate) && (
              <p className="text-sm text-amber-600 sm:col-span-2">
                Select both dates to view sales for your custom range.
              </p>
            )}

            {customStartDate &&
              customEndDate &&
              customStartDate > customEndDate && (
                <p className="text-sm text-red-600 sm:col-span-2">
                  Start date cannot be later than end date.
                </p>
              )}

          </div>
        )}
      </div>

      {/* Sales Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<IndianRupee size={20} />}
        />

        <MetricCard
          title="Total Transactions"
          value={dateFilteredSales.length}
          icon={<ShoppingCart size={20} />}
        />

        <MetricCard
          title="Units Sold"
          value={totalUnits}
          icon={<TrendingUp size={20} />}
        />

        <MetricCard
          title="Average Order Value"
          value={formatCurrency(averageOrderValue)}
          icon={<IndianRupee size={20} />}
        />

      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monthly revenue for the selected period.
          </p>
        </div>

        {monthlyRevenue.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyRevenue}
                margin={{
                  top: 10,
                  right: 15,
                  left: 5,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#6366f1"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="95%"
                      stopColor="#6366f1"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={85}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString('en-IN')}`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    'Revenue',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 6 }}
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-center text-sm text-slate-400">
            Select a valid date range to view revenue data.
          </div>
        )}
      </div>

      {/* Record Sale Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Record New Sale
            </h2>

            <button
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
                Product
              </label>

              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              >
                <option value="">Select a product</option>

                {products.map((product) => (
                  <option
                    key={product._id}
                    value={product._id}
                    disabled={product.stock <= 0}
                  >
                    {product.name} — Stock: {product.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                name="quantity"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer Name
              </label>

              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Walk-in Customer"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Method
              </label>

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Online">Online</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">

              <button
                type="submit"
                disabled={saving || products.length === 0}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Recording...' : 'Save Sale'}
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

      {/* Sales Transactions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <h2 className="text-lg font-bold text-slate-800">
            Sales Transactions
          </h2>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr
                  key={sale._id}
                  className="border-b border-slate-50"
                >
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {sale.productName}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {sale.customerName}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {sale.quantity}
                  </td>

                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {formatCurrency(sale.totalAmount)}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {sale.paymentMethod}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {new Date(sale.saleDate).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    {search
                      ? 'No matching sales found.'
                      : 'No sales recorded for this date range.'}
                  </td>
                </tr>
              )}
            </tbody>

          </table>
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

export default Sales
