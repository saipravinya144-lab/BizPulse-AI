
const mongoose = require('mongoose')

const Sale = require('../models/Sale')
const Product = require('../models/Product')

// Create a new manual sale
const createSale = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      customerName,
      paymentMethod,
      saleDate,
    } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product and quantity are required.',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const parsedQuantity = Number(quantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive whole number.',
      })
    }

    const allowedMethods = ['Cash', 'Card', 'UPI', 'Online', 'Other']

    if (
      paymentMethod &&
      !allowedMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      })
    }

    const parsedDate = saleDate ? new Date(saleDate) : new Date()

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sale date.',
      })
    }

    const session = await mongoose.startSession()

    let createdSale
    let remainingStock

    try {
      await session.withTransaction(async () => {
        const product = await Product.findOneAndUpdate(
          {
            _id: productId,
            business: req.user.businessId,
            stock: { $gte: parsedQuantity },
          },
          {
            $inc: { stock: -parsedQuantity },
          },
          {
            new: true,
            session,
          }
        )

        if (!product) {
          const existingProduct = await Product.findOne({
            _id: productId,
            business: req.user.businessId,
          }).session(session)

          if (!existingProduct) {
            const error = new Error('Product not found in your inventory.')
            error.statusCode = 404
            throw error
          }

          const error = new Error('Insufficient stock for this sale.')
          error.statusCode = 400
          throw error
        }

        const sales = await Sale.create(
          [{
            product: product._id,
            productName: product.name,
            quantity: parsedQuantity,
            unitPrice: product.price,
            totalAmount: product.price * parsedQuantity,
            customerName:
              typeof customerName === 'string' && customerName.trim()
                ? customerName.trim()
                : 'Walk-in Customer',
            paymentMethod: paymentMethod || 'Cash',
            saleDate: parsedDate,
            business: req.user.businessId,
            source: 'manual',
          }],
          { session }
        )

        createdSale = sales[0]
        remainingStock = product.stock
      })
    } finally {
      await session.endSession()
    }

    return res.status(201).json({
      success: true,
      message: 'Sale recorded successfully.',
      sale: createdSale,
      remainingStock,
    })
  } catch (error) {
    console.error('Create sale error:', error.message)

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to record sale.',
    })
  }
}

// Import multiple sales from CSV data
const importSales = async (req, res) => {
  const { rows } = req.body

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one sales record.',
    })
  }

  if (rows.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'A maximum of 500 sales records can be imported at once.',
    })
  }

  const allowedMethods = ['Cash', 'Card', 'UPI', 'Online', 'Other']

  const validatedRows = []
  const requiredStock = new Map()

  try {
    // Validate every row before changing inventory
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]
      const rowNumber = index + 1

      if (
        !row ||
        typeof row !== 'object' ||
        !row.productId ||
        !mongoose.Types.ObjectId.isValid(row.productId)
      ) {
        return res.status(400).json({
          success: false,
          message: `Row ${rowNumber}: A valid productId is required.`,
        })
      }

      const quantity = Number(row.quantity)

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Row ${rowNumber}: Quantity must be a positive whole number.`,
        })
      }

      const paymentMethod = row.paymentMethod || 'Cash'

      if (!allowedMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: `Row ${rowNumber}: Invalid payment method.`,
        })
      }

      const customerName =
        typeof row.customerName === 'string' && row.customerName.trim()
          ? row.customerName.trim()
          : 'Walk-in Customer'

      const saleDate = row.saleDate
        ? new Date(row.saleDate)
        : new Date()

      if (Number.isNaN(saleDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: `Row ${rowNumber}: Invalid sale date.`,
        })
      }

      const productId = row.productId.toString()

      requiredStock.set(
        productId,
        (requiredStock.get(productId) || 0) + quantity
      )

      validatedRows.push({
        productId,
        quantity,
        customerName,
        paymentMethod,
        saleDate,
      })
    }

    const session = await mongoose.startSession()

    let importedSales = []

    try {
      await session.withTransaction(async () => {
        const productIds = [...requiredStock.keys()]

        const products = await Product.find({
          _id: { $in: productIds },
          business: req.user.businessId,
        }).session(session)

        const productMap = new Map(
          products.map((product) => [
            product._id.toString(),
            product,
          ])
        )

        // Verify all products belong to this business
        for (const productId of productIds) {
          if (!productMap.has(productId)) {
            const error = new Error(
              'One or more products were not found in your inventory.'
            )
            error.statusCode = 404
            throw error
          }
        }

        // Verify sufficient stock for the entire import
        for (const [productId, quantity] of requiredStock) {
          const product = productMap.get(productId)

          if (product.stock < quantity) {
            const error = new Error(
              `Insufficient stock for ${product.name}. Available: ${product.stock}, required: ${quantity}.`
            )
            error.statusCode = 400
            throw error
          }
        }

        // Reduce stock for each product
        for (const [productId, quantity] of requiredStock) {
          const updatedProduct = await Product.updateOne(
            {
              _id: productId,
              business: req.user.businessId,
              stock: { $gte: quantity },
            },
            {
              $inc: { stock: -quantity },
            },
            { session }
          )

          if (updatedProduct.modifiedCount !== 1) {
            const error = new Error(
              'Inventory changed during import. Please try again.'
            )
            error.statusCode = 409
            throw error
          }
        }

        // Prepare and save imported sales
        const saleDocuments = validatedRows.map((row) => {
          const product = productMap.get(row.productId)

          return {
            product: product._id,
            productName: product.name,
            quantity: row.quantity,
            unitPrice: product.price,
            totalAmount: product.price * row.quantity,
            customerName: row.customerName,
            paymentMethod: row.paymentMethod,
            saleDate: row.saleDate,
            business: req.user.businessId,
            source: 'csv',
          }
        })

        importedSales = await Sale.insertMany(
          saleDocuments,
          { session, ordered: true }
        )
      })
    } finally {
      await session.endSession()
    }

    const totalRevenue = importedSales.reduce(
      (total, sale) => total + sale.totalAmount,
      0
    )

    return res.status(201).json({
      success: true,
      message: 'CSV sales imported successfully.',
      importedCount: importedSales.length,
      totalRevenue,
      sales: importedSales,
    })
  } catch (error) {
    console.error('Import sales error:', error.message)

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to import sales.',
    })
  }
}

// Get all sales for the logged-in business
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({
      business: req.user.businessId,
    }).sort({ saleDate: -1, createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    })
  } catch (error) {
    console.error('Get sales error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch sales.',
    })
  }
}

// Get one sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      business: req.user.businessId,
    })

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found.',
      })
    }

    return res.status(200).json({
      success: true,
      sale,
    })
  } catch (error) {
    console.error('Get sale error:', error.message)

    return res.status(400).json({
      success: false,
      message: 'Unable to fetch sale.',
    })
  }
}

module.exports = {
  createSale,
  importSales,
  getSales,
  getSaleById,
}
