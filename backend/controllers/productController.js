
const Product = require('../models/Product')

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, lowStockThreshold } = req.body

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category and price are required.',
      })
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock: stock ?? 0,
      lowStockThreshold: lowStockThreshold ?? 10,
      business: req.user.businessId,
    })

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    })
  } catch (error) {
    console.error('Create product error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to create product.',
    })
  }
}

// Get all products belonging to the logged-in business
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      business: req.user.businessId,
    }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('Get products error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch products.',
    })
  }
}

// Update a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        business: req.user.businessId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    })
  } catch (error) {
    console.error('Update product error:', error.message)

    return res.status(400).json({
      success: false,
      message: 'Unable to update product.',
    })
  }
}

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      business: req.user.businessId,
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    })
  } catch (error) {
    console.error('Delete product error:', error.message)

    return res.status(400).json({
      success: false,
      message: 'Unable to delete product.',
    })
  }
}

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
}
