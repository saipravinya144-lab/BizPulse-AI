
const express = require('express')

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All product routes require authentication
router.use(protect)

// Create a product
router.post('/', createProduct)

// Get all products
router.get('/', getProducts)

// Update a product
router.put('/:id', updateProduct)

// Delete a product
router.delete('/:id', deleteProduct)

module.exports = router
