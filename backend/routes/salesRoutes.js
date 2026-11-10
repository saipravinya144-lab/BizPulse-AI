
const express = require('express')

const {
  createSale,
  getSales,
  getSaleById,
  importSales,
} = require('../controllers/salesController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All sales routes require authentication
router.use(protect)

// Import multiple sales from CSV data
router.post('/import', importSales)

// Create a single sale
router.post('/', createSale)

// Get all sales
router.get('/', getSales)

// Get a single sale
router.get('/:id', getSaleById)

module.exports = router
