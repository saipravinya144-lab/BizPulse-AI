
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Sale = require('../models/Sale')
const Feedback = require('../models/Feedback')

// Collect business information from MongoDB
const getBusinessContext = async (businessId) => {
  if (!businessId) {
    throw new Error('Business ID is required to fetch business data.')
  }

  // Convert business ID to MongoDB ObjectId for aggregation queries
  const businessObjectId = new mongoose.Types.ObjectId(businessId)

  // Fetch business data in parallel
  const [
    products,
    salesSummary,
    topProducts,
    recentSales,
    feedbackSummary,
    recentFeedback,
  ] = await Promise.all([

    // Inventory information
    Product.find({ business: businessObjectId })
      .select('name category price stock lowStockThreshold')
      .lean(),

    // Overall sales statistics
    Sale.aggregate([
      {
        $match: {
          business: businessObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
          unitsSold: { $sum: '$quantity' },
        },
      },
    ]),

    // Best-selling products
    Sale.aggregate([
      {
        $match: {
          business: businessObjectId,
        },
      },
      {
        $group: {
          _id: '$productName',
          unitsSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $sort: {
          unitsSold: -1,
        },
      },
      {
        $limit: 5,
      },
    ]),

    // Latest sales transactions
    Sale.find({ business: businessObjectId })
      .select('productName quantity totalAmount saleDate paymentMethod')
      .sort({ saleDate: -1 })
      .limit(5)
      .lean(),

    // Customer feedback statistics
    Feedback.aggregate([
      {
        $match: {
          business: businessObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          positive: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0],
            },
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0],
            },
          },
          neutral: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0],
            },
          },
          unanalysed: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'unanalysed'] }, 1, 0],
            },
          },
        },
      },
    ]),

    // Latest customer reviews
    Feedback.find({ business: businessObjectId })
      .select('message rating sentiment aiSummary createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])

  // Calculate inventory statistics
  const totalProducts = products.length

  const totalInventoryUnits = products.reduce(
    (total, product) => total + product.stock,
    0
  )

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.lowStockThreshold
  )

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  )

  // Calculate sales statistics
  const sales = salesSummary[0] || {
    totalRevenue: 0,
    totalSales: 0,
    unitsSold: 0,
  }

  const averageOrderValue =
    sales.totalSales > 0
      ? sales.totalRevenue / sales.totalSales
      : 0

  // Calculate customer feedback statistics
  const feedback = feedbackSummary[0] || {
    totalFeedback: 0,
    averageRating: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    unanalysed: 0,
  }

  // Return structured business information
  return {
    inventory: {
      totalProducts,
      totalInventoryUnits,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.map((product) => ({
        name: product.name,
        category: product.category,
        availableStock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
      })),
      products: products.map((product) => ({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      })),
    },

    sales: {
      totalRevenue: Number(sales.totalRevenue.toFixed(2)),
      totalTransactions: sales.totalSales,
      unitsSold: sales.unitsSold,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      topProducts,
      recentTransactions: recentSales,
    },

    customerFeedback: {
      totalFeedback: feedback.totalFeedback,
      averageRating: Number(
        (feedback.averageRating || 0).toFixed(1)
      ),
      sentimentBreakdown: {
        positive: feedback.positive,
        negative: feedback.negative,
        neutral: feedback.neutral,
        unanalysed: feedback.unanalysed,
      },
      recentReviews: recentFeedback,
    },

    generatedAt: new Date().toISOString(),
  }
}

module.exports = { getBusinessContext }
