
const Sale = require('../models/Sale')
const Product = require('../models/Product')
const Feedback = require('../models/Feedback')
const mongoose = require('mongoose')
const { getBusinessContext } = require('../services/businessContextService')

// @desc Get complete business reports
// @route GET /api/reports
// @access Private
const getBusinessReports = async (req, res) => {
  try {
    const businessId = new mongoose.Types.ObjectId(
      req.user.businessId
    )

    // 1. Sales overview
    const salesOverview = await Sale.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
          totalUnitsSold: { $sum: '$quantity' },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ])

    // 2. Monthly revenue
    const monthlyRevenue = await Sale.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
          },
          revenue: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // 3. Product performance
    const productPerformance = await Sale.aggregate([
      {
        $match: {
          business: businessId,
          product: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productName' },
          unitsSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ])

    // 4. Inventory overview
    const inventoryOverview = await Product.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $lte: ['$stock', '$lowStockThreshold'] },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    // 5. Customer feedback overview
    const feedbackOverview = await Feedback.aggregate([
      { $match: { business: businessId } },
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
          neutral: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0],
            },
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0],
            },
          },
          unanalyzed: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'unanalysed'] }, 1, 0],
            },
          },
        },
      },
    ])

    // 6. Payment method breakdown
    const paymentBreakdown = await Sale.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: '$paymentMethod',
          transactions: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
    ])

    // 7. Recent sales
    const recentSales = await Sale.find({ business: businessId })
      .sort({ saleDate: -1 })
      .limit(5)
      .select('productName quantity totalAmount saleDate paymentMethod')

    // 8. Business insights context
    const businessContext = await getBusinessContext(
      businessId.toString()
    )

    res.status(200).json({
      success: true,
      reports: {
        salesOverview: salesOverview[0] || {
          totalRevenue: 0,
          totalSales: 0,
          totalUnitsSold: 0,
          averageOrderValue: 0,
        },
        monthlyRevenue,
        productPerformance,
        inventoryOverview: inventoryOverview[0] || {
          totalProducts: 0,
          totalStock: 0,
          lowStockProducts: 0,
        },
        feedbackOverview: feedbackOverview[0] || {
          totalFeedback: 0,
          averageRating: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          unanalyzed: 0,
        },
        paymentBreakdown,
        recentSales,
        businessContext,
      },
    })
  } catch (error) {
    console.error('Get business reports error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to generate business reports.',
    })
  }
}

module.exports = {
  getBusinessReports,
}
